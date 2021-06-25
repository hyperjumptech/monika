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
import DashboardIconSvg from '../../../public/dashboard-icon.svg'
import TimerIconSvg from '../../../public/timer-icon.svg'
import AlarmIconSvg from '../../../public/alarm-icon.svg'
import ListIconSvg from '../../../public/list-icon.svg'
import RecycleIconSvg from '../../../public/recycle-icon.svg'
import WhatsAppIconSvg from '../../../public/whatsapp-icon.svg'

export default function FeatureBanner() {
  return (
    <div className="relative flex flex-col bg-white py-32 z-10 transform -skew-y-6 -mt-20">
      <div className="w-1/4 h-6 absolute top-0 right-0 bg-gradient-to-r from-purple-monika to-aqua-monika" />
      <div className="w-1/4 h-6 absolute bottom-0 left-0 bg-gradient-to-r from-purple-monika to-aqua-monika" />
      <div className="m-auto mx-1/6 flex flex-col z-10 transform skew-y-6">
        <h2 className="mr-auto bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold text-xl">
          Why Monika
        </h2>
        <h2 className="text-3xl">
          Free and Open Source Synthetic
          <br />
          Monitoring Tool
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 grid-flow-row mt-4">
          <div>
            <img className="max-h-20" src={DashboardIconSvg} />
            <h3 className="font-semibold">Monitor Multiple Websites</h3>
            <p>
              You can add as many websites as you want to monitor with Monika to
              help grow your business.
            </p>
          </div>
          <div>
            <img className="max-h-20" src={TimerIconSvg} />
            <h3 className="font-semibold">Monitor Service Quality</h3>
            <p>
              With Monika, you can monitor website several status such as down
              or slow based on notifications.
            </p>
          </div>
          <div>
            <img className="max-h-20" src={AlarmIconSvg} />
            <h3 className="font-semibold">Various Notifications</h3>
            <p>
              Get notified of the incidents on your website through your
              favourite communication tools like SMTP mail, telegram, and etc.
            </p>
          </div>
          <div>
            <img className="max-h-20" src={ListIconSvg} />
            <h3 className="font-semibold">Customizable Requests</h3>
            <p>
              Monitor all parts of your websites. For example, you can monitor
              your login performance with Monika.
            </p>
          </div>
          <div>
            <img className="max-h-20" src={RecycleIconSvg} />
            <h3 className="font-semibold">Requests Chaining</h3>
            <p>
              Request chaining enables you to send multiple requests and the
              ability to use past responses as parameters.
            </p>
          </div>
          <div>
            <img className="max-h-20" src={WhatsAppIconSvg} />
            <h3 className="font-semibold">Whatsapp Notifications</h3>
            <p>Get alert notifications directly to your WhatsApp account.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
