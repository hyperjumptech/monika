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

export default function FeatureBanner() {
  return (
    <div className="relative bg-white h-screen z-10 transform -skew-y-6 -mt-20">
      <div className="w-1/4 h-8 absolute top-0 right-0 bg-gradient-to-r from-purple-monika to-aqua-monika" />
      <div className="w-1/4 h-8 absolute bottom-0 left-0 bg-gradient-to-r from-purple-monika to-aqua-monika" />
      <div className="relative flex flex-col justify-center z-10 w-auto m-auto pt-48 transform skew-y-6">
        <h2 className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold text-3xl">
          Why Monika
        </h2>
        <h2 className="text-3xl">
          Free and Open Source Synthetic
          <br />
          Monitoring Tool
        </h2>
      </div>
    </div>
  )
}
