import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentEntity } from './document.entity';

type Frontmatter = { source: string; title: string; url: string };
type Chunk = { title: string; content: string };

export function parseFrontmatter(raw: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const parts = raw.split('---');
  const fmBlock = parts[1] ?? '';
  const body = parts.slice(2).join('---').trim();

  const frontmatter: Frontmatter = { source: '', title: '', url: '' };
  for (const line of fmBlock.trim().split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key === 'source') frontmatter.source = value;
    if (key === 'title') frontmatter.title = value;
    if (key === 'url') frontmatter.url = value;
  }

  return { frontmatter, body };
}

export function chunkByH2(body: string, pageTitle: string): Chunk[] {
  const parts = body.split(/\n(?=## )/);
  const chunks: Chunk[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      const firstLine = trimmed.split('\n')[0];
      const title = firstLine.replace(/^## /, '').trim();
      chunks.push({ title, content: trimmed });
    } else {
      chunks.push({ title: pageTitle, content: trimmed });
    }
  }

  return chunks;
}

@Injectable()
export class DocumentSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DocumentSeederService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('Skipping document seeding in production environment');
      return;
    }

    const contentDir = path.join(process.cwd(), '..', 'canvas_content');

    let allFiles: string[];
    try {
      allFiles = await fs.readdir(contentDir);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.warn(`canvas_content directory not found at ${contentDir}, skipping seeding`);
        return;
      }
      throw error;
    }

    const mdFiles = allFiles.filter((f) => f.endsWith('.md'));

    const fileContents = await Promise.all(
      mdFiles.sort().map((f) => fs.readFile(path.join(contentDir, f), 'utf-8')),
    );
    const currentHash = crypto.createHash('sha256').update(fileContents.join('\0')).digest('hex');

    const hashFile = path.join(contentDir, '.seed-hash');
    let previousHash = '';
    try {
      previousHash = (await fs.readFile(hashFile, 'utf-8')).trim();
    } catch {
      // No hash file yet — first boot.
    }

    if (currentHash === previousHash) {
      this.logger.log('canvas_content unchanged, skipping document re-seeding');
      return;
    }

    await this.documentRepository.createQueryBuilder().delete().execute();
    this.logger.log(`Cleared documents table. Seeding ${mdFiles.length} files from ${contentDir}`);

    for (const file of mdFiles) {
      const raw = await fs.readFile(path.join(contentDir, file), 'utf-8');
      const { frontmatter, body } = parseFrontmatter(raw);

      const hasSource = frontmatter.source.trim().length > 0;
      const hasTitle = frontmatter.title.trim().length > 0;
      const hasUrl = frontmatter.url.trim().length > 0;

      if (!hasSource || !hasTitle || !hasUrl) {
        this.logger.warn(
          `Skipping "${file}" due to missing frontmatter — ` +
            `source: "${frontmatter.source}", title: "${frontmatter.title}", url: "${frontmatter.url}"`,
        );
        continue;
      }

      const chunks = chunkByH2(body, frontmatter.title);
      this.logger.log(`${file}: ${chunks.length} chunk(s)`);

      const entities: Partial<DocumentEntity>[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const { title, content } = chunks[i];
        const embedding = await this.embeddingService.embedText(content);

        if (embedding === null) {
          this.logger.warn(
            `${file} chunk ${i} ("${title}"): embedding failed, saving without vector`,
          );
        }

        entities.push({
          content,
          embedding,
          metadata: {
            source: frontmatter.source,
            title: frontmatter.title,
            url: frontmatter.url,
            chunkIndex: i,
          },
        });
      }

      await this.documentRepository.save(entities);
    }

    await fs.writeFile(hashFile, currentHash, 'utf-8');
    this.logger.log('Seeding complete');
  }
}
