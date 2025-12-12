
export function sleep(durationMs: number) {
    return new Promise(res =>
        setTimeout(res, durationMs)
    );
}
