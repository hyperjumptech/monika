/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

// Note: Loose standard on event names. not really enforced
// but if done right, should be clear and self documenting.

// format is: SCOPE_ITEM_STATE
// scope : is where it came from ie: probe, or config or maybe timer
// item  : is the "item" that the listener will be processing/handling
// state : is the state of that item, is it ready? is it received?

export const CONFIG_SANITIZED = 'CONFIG_SANITIZED'
export const PROBE_RESPONSE_RECEIVED = 'PROBE_RESPONSE_RECEIVED'
export const PROBE_RESPONSE_VALIDATED = 'PROBE_RESPONSE_VALIDATED'
export const PROBE_ALERTS_READY = 'PROBE_ALERTS_READY'
export const PROBE_LOGS_BUILT = 'PROBE_LOGS_BUILT'
