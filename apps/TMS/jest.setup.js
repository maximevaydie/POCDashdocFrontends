import "jest-canvas-mock";
/**
 * Fix for "ReferenceError: TextEncoder is not defined"
 * While it should be bundled with jsdom, it isn't with jsdom.
 */
import {TextDecoder, TextEncoder} from "util";
Object.assign(global, {TextDecoder, TextEncoder});
