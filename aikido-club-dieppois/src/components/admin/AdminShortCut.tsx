import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AdminShortcut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Combinaison : Ctrl (ou Cmd sur Mac) + Shift + 'A' (pour Admin)
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault(); 
        navigate("/admin/login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);


    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return null; 
};