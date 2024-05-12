import { useState } from "react";
import {
  Input,
  Stack,
  IconButton,
  useToast,
  Box,
  Container,
} from "@chakra-ui/react";
import { BiSend } from "react-icons/bi";
import { useAppContext } from "../context/appContext";
import axios from "axios";
import supabase from "../supabaseClient";

export default function MessageForm() {
  const { username, country, session } = useAppContext();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("Hi there! How can I assist you?");
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    if (!message) return;

    let prompt = message;

    try {
      // Insert message into Supabase
      const { error } = await supabase.from("messages").insert([
        {
          text: message,
          username,
          country,
          is_authenticated: session ? true : false,
        },
      ]);

      if (error) {
        throw new Error("Error inserting message into Supabase");
      }
      
      // Insert chatbot response into Supabase only if message starts with "hey ai"
      if (message.toLowerCase().startsWith("hey ai")) {
        // Fetch response from the chatbot API
        const responseFromChatbot = await axios.post("https://aichathub.onrender.com/chatbot", {
          text: message,
          question: prompt,
        });

        const { error: chatbotError } = await supabase.from("messages").insert([
          {
            text: responseFromChatbot.data,
            username: "Chatbot",
            country: "",
            is_authenticated: true,
          },
        ]);

        if (chatbotError) {
          throw new Error("Error inserting chatbot response into Supabase");
        }
        
        // Set the chatbot response
        setResponse(responseFromChatbot.data);
      } else {
        // Set default response if message does not start with "hey ai"
       
      }
      
      // Reset the message state to clear the message box
      setMessage("");
    } catch (error) {
      console.error("Error handling message submission:", error);
      toast({
        title: "Error",
        description: "Failed to process your message.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box py="10px" pt="15px" bg="gray.100">
      <Container maxW="600px">
        <form onSubmit={handleSubmit} autoComplete="off">
          <Stack direction="row">
            <Input
              name="message"
              placeholder="Enter a message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              bg="white"
              border="none"
              autoFocus
              maxLength="500"
            />
            <IconButton
              colorScheme="teal"
              aria-label="Send"
              fontSize="20px"
              icon={<BiSend />}
              type="submit"
              disabled={!message}
              isLoading={isSending}
            />
          </Stack>
        </form>
        <Box fontSize="14px" mt="1">
          Start you message with "hey ai" to talk to chatbot
        </Box>
        <div>
          {/* Display chatbot response or other messages */}
        </div>
      </Container>
    </Box>
  );
}
