import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./firebase"; // Initialize Firebase

createRoot(document.getElementById("root")!).render(<App />);
