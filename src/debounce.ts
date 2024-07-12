/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @license Modified version of lodash's debounce function. See https://github.com/lodash/lodash/blob/main/LICENSE.
 *
 * Source code: https://github.com/lodash/lodash/blob/main/src/debounce.ts
 */

interface DebounceOptions {
	leading?: boolean;
	maxWait?: number;
	trailing?: boolean;
}

interface DebouncedFunction<F extends ( ...args: Array<any> ) => any> {
	( ...args: Parameters<F> ): ReturnType<F>;
	cancel(): void;
	flush(): ReturnType<F>;
	pending(): boolean;
}

export function debounce<TArgs extends Array<any>, TReturnType>(
	func: ( ...args: TArgs ) => TReturnType,
	wait: number = 0,
	options?: DebounceOptions
): DebouncedFunction<( ...args: TArgs ) => TReturnType> {
	// Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
	const useRAF = !wait && wait !== 0 && typeof requestAnimationFrame === 'function';

	let lastArgs: any;
	let lastThis: any;
	let maxWait: number | undefined;
	let result: TReturnType;
	let timerId: number | undefined;
	let lastCallTime: number | undefined;
	let lastInvokeTime: number = 0;
	let leading: boolean = false;
	let maxing: boolean = false;
	let trailing: boolean = true;

	wait = Number( wait ) || 0;

	if ( options ) {
		leading = !!options.leading;
		maxing = 'maxWait' in options;
		maxWait = maxing ? Math.max( options.maxWait || 0, wait ) : maxWait;
		trailing = 'trailing' in options ? !!options.trailing : trailing;
	}

	function invokeFunc( time: number ) {
		const args = lastArgs;
		const thisArg = lastThis;

		lastArgs = lastThis = undefined;
		lastInvokeTime = time;
		result = func.apply( thisArg, args );
		return result;
	}

	function startTimer( pendingFunc: () => unknown, milliseconds: number ) {
		if ( useRAF ) {
			cancelAnimationFrame( timerId! );

			return requestAnimationFrame( pendingFunc );
		}

		return setTimeout( pendingFunc, milliseconds );
	}

	function cancelTimer( id: number ) {
		if ( useRAF ) {
			cancelAnimationFrame( id );

			return;
		}

		clearTimeout( id );
	}

	function leadingEdge( time: number ) {
		// Reset any `maxWait` timer.
		lastInvokeTime = time;
		// Start the timer for the trailing edge.
		timerId = startTimer( timerExpired, wait );

		// Invoke the leading edge.
		return leading ? invokeFunc( time ) : result;
	}

	function remainingWait( time: number ) {
		const timeSinceLastCall = time - lastCallTime!;
		const timeSinceLastInvoke = time - lastInvokeTime;
		const timeWaiting = wait - timeSinceLastCall;

		return maxing ? Math.min( timeWaiting, maxWait! - timeSinceLastInvoke ) : timeWaiting;
	}

	function shouldInvoke( time: number ) {
		const timeSinceLastCall = time - lastCallTime!;
		const timeSinceLastInvoke = time - lastInvokeTime;

		// Either this is the first call, activity has stopped and we're at the
		// trailing edge, the system time has gone backwards and we're treating
		// it as the trailing edge, or we've hit the `maxWait` limit.
		return (
			lastCallTime === undefined ||
			timeSinceLastCall >= wait ||
			timeSinceLastCall < 0 ||
			( maxing && timeSinceLastInvoke >= maxWait! )
		);
	}

	function timerExpired() {
		const time = Date.now();

		if ( shouldInvoke( time ) ) {
			return trailingEdge( time );
		}

		// Restart the timer.
		timerId = startTimer( timerExpired, remainingWait( time ) );

		return undefined;
	}

	function trailingEdge( time: number ) {
		timerId = undefined;

		// Only invoke if we have `lastArgs` which means `func` has been
		// debounced at least once.
		if ( trailing && lastArgs ) {
			return invokeFunc( time );
		}

		lastArgs = lastThis = undefined;

		return result;
	}

	function cancel() {
		if ( timerId !== undefined ) {
			cancelTimer( timerId );
		}

		lastInvokeTime = 0;
		lastArgs = lastCallTime = lastThis = timerId = undefined;
	}

	function flush() {
		return timerId === undefined ? result : trailingEdge( Date.now() );
	}

	function pending() {
		return timerId !== undefined;
	}

	// https://www.typescriptlang.org/docs/handbook/2/functions.html#declaring-this-in-a-function
	function debounced( this: any, ...args: Array<any> ) {
		const time = Date.now();
		const isInvoking = shouldInvoke( time );

		lastArgs = args;
		// eslint-disable-next-line consistent-this, @typescript-eslint/no-this-alias
		lastThis = this;
		lastCallTime = time;

		if ( isInvoking ) {
			if ( timerId === undefined ) {
				return leadingEdge( lastCallTime );
			}

			if ( maxing ) {
				// Handle invocations in a tight loop.
				timerId = startTimer( timerExpired, wait );
				return invokeFunc( lastCallTime );
			}
		}

		if ( timerId === undefined ) {
			timerId = startTimer( timerExpired, wait );
		}

		return result;
	}

	debounced.cancel = cancel;
	debounced.flush = flush;
	debounced.pending = pending;

	return debounced;
}
