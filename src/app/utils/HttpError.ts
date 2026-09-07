import { ErroResponse } from "../models/dto/ErroResponse";

export class HttpError extends Error {
    constructor(
        public status: number,
        public response: ErroResponse | null = null,
    ) {
        super(`Request failed with status ${status}`);
        this.name = "HttpError";
    }
}