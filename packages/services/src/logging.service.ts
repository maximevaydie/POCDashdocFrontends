/* eslint-disable no-console */

let DEV = import.meta.env.DEV;

export class Logger {
    static log(...args: any[]) {
        if (DEV) {
            console.log(...args);
        }
    }

    static warn(...args: any[]) {
        if (DEV) {
            console.warn(...args);
        }
    }

    static error(...args: any[]) {
        if (DEV) {
            console.error(...args);
        }
    }

    static async getError<T>(error: any): Promise<T> {
        if (error.json) {
            return await error.json();
        } else {
            return error;
        }
    }

    static serverError(error: any, callback?: (errorText: string) => void) {
        this.getError<string>(error).then((errorText: string) => {
            Logger.error(`Error ${errorText}`);
            if (callback !== undefined) {
                callback(errorText);
            }
        });
    }
}
