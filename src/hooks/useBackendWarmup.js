import { useCallback, useEffect, useState } from "react";
import { wakeBackend } from "../services/api";

export default function useBackendWarmup() {
  const [status, setStatus] = useState("connecting");

  const connect = useCallback(async () => {
    setStatus("connecting");
    try {
      await wakeBackend();
      setStatus("ready");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  return { status, retry: connect };
}
