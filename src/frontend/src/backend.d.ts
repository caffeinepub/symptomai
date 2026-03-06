import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface History {
    id: bigint;
    cause: string;
    timestamp: Time;
    disease: string;
    symptoms: string;
    precautions: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    analyzeSymptoms(symptoms: string): Promise<bigint>;
    clearHistory(): Promise<void>;
    getHistory(): Promise<Array<History>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
