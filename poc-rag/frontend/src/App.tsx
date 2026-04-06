import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import type { FormEvent } from "react";
import { useState } from "react";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const welcomeMessage =
  "Hallo! Ik ben je studieassistent. Stel me een vraag over het stappenplan, je semesterplan of hoe Pro Open Learning werkt.";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.filter(
            (item) =>
              item.role !== "assistant" || item.content !== welcomeMessage,
          ),
        }),
      });

      const payload = (await response.json()) as { answer?: string };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            payload.answer ??
            "Er ging iets mis bij het ophalen van een antwoord.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "De backend is momenteel niet bereikbaar.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f7f2 0%, #ffffff 45%, #eef4ff 100%)",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{ backdropFilter: "blur(16px)" }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h6" fontWeight={700}>
            Fontys Studieassistent PoC
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, pb: 18 }}>
        <Stack spacing={2}>
          {messages.map((message, index) => (
            <Box
              key={`${message.role}-${index}`}
              sx={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Stack
                direction={message.role === "user" ? "row-reverse" : "row"}
                spacing={1.5}
                alignItems="flex-start"
                sx={{ maxWidth: "85%" }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      message.role === "user" ? "primary.main" : "grey.700",
                  }}
                >
                  {message.role === "user" ? (
                    "J"
                  ) : (
                    <SmartToyRoundedIcon fontSize="small" />
                  )}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor:
                      message.role === "user" ? "primary.main" : "grey.200",
                    color:
                      message.role === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                </Paper>
              </Stack>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: "grey.700" }}>
                  <SmartToyRoundedIcon fontSize="small" />
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: "grey.200" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="body2">Aan het typen...</Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(16px)",
          py: 2,
        }}
      >
        <Container maxWidth="md">
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="Stel je vraag over Pro Open Learning..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendRoundedIcon />}
              disabled={loading}
            >
              Verstuur
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
