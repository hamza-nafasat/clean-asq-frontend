import { io } from "socket.io-client";
import getEnv from "@/utils/env";

export const socket = io(getEnv("SERVER_URL"), {
  path: "/api/socket.io",
  withCredentials: true,
});
