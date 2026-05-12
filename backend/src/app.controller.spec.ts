import { AppController } from './app.controller';
import { EchoMessageDto } from './echo-message.dto';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController(new AppService());
  });

  describe('root', () => {
    it('should return API info', () => {
      expect(appController.getInfo()).toEqual({
        name: 'fontys-lms-backend',
        version: '0.0.1',
      });
    });

    it('should echo the DTO payload', () => {
      const dto: EchoMessageDto = { message: 'Hallo Fontys' };

      expect(appController.echo(dto)).toEqual(dto);
    });
  });
});
