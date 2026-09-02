import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ErroAlerta {
    titulo: string;
    mensagem: string;
}

export function GlobalErrorAlert() {
    const [erro, setErro] = useState<ErroAlerta | null>(null);

    useEffect(() => {
        const handler = (event: Event) => {
            setErro((event as CustomEvent<ErroAlerta>).detail);
        };
        window.addEventListener("app:error", handler);
        return () => window.removeEventListener("app:error", handler);
    }, []);

    if (!erro) return null;

    return (
        <div className="fixed top-4 right-4 z-50 w-96">
            <Alert variant="destructive">
                <AlertTitle>{erro.titulo}</AlertTitle>
                <AlertDescription>{erro.mensagem}</AlertDescription>
            </Alert>
        </div>
    );
}