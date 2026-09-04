import React, { useState } from "react";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_AR = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

interface Props {
  seller: any;
  onUpdate: (updated: any) => void;
}

export default function ScheduleSettings({ seller, onUpdate }: Props) {
  const { isArabic } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const parseDays = (str: string | null): number[] => {
    if (!str) return [0, 1, 2, 3, 4, 5, 6];
    return str.split(",").map(Number).filter(n => !isNaN(n));
  };

  const [selectedDays, setSelectedDays] = useState<number[]>(parseDays(seller?.available_days));
  const [fromTime, setFromTime] = useState(seller?.available_from || "09:00");
  const [untilTime, setUntilTime] = useState(seller?.available_until || "21:00");
  const [accepting, setAccepting] = useState(seller?.accepting_orders !== false);
  const [useSchedule, setUseSchedule] = useState(!!(seller?.available_days || seller?.available_from));

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const save = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const payload: any = { accepting_orders: accepting };
      if (useSchedule) {
        payload.available_days = selectedDays.join(",");
        payload.available_from = fromTime;
        payload.available_until = untilTime;
      } else {
        payload.available_days = null;
        payload.available_from = null;
        payload.available_until = null;
      }
      const res = await api.patch("/api/sellers/schedule", payload);
      onUpdate(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-gray-900">
        {isArabic ? "🕐 ساعات العمل" : "🕐 Schedule & Hours"}
      </h2>

      {/* Master toggle */}
      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">{isArabic ? "قبول الطلبات" : "Accepting Orders"}</p>
          <p className="text-sm text-gray-500">{isArabic ? "أوقف هذا لرفض جميع الطلبات مؤقتاً" : "Turn off to pause all orders"}</p>
        </div>
        <button
          onClick={() => setAccepting(!accepting)}
          className={`relative w-14 h-7 rounded-full transition-colors ${accepting ? "bg-orange-500" : "bg-gray-300"}`}
        >
          <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${accepting ? "translate-x-7" : ""}`} />
        </button>
      </div>

      {/* Use schedule toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{isArabic ? "تحديد أوقات محددة" : "Set specific hours"}</p>
          <p className="text-sm text-gray-500">{isArabic ? "حدد الأيام وأوقات العمل" : "Limit orders to certain days & times"}</p>
        </div>
        <button
          onClick={() => setUseSchedule(!useSchedule)}
          className={`relative w-14 h-7 rounded-full transition-colors ${useSchedule ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${useSchedule ? "translate-x-7" : ""}`} />
        </button>
      </div>

      {useSchedule && (
        <>
          {/* Day selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{isArabic ? "أيام العمل" : "Working Days"}</p>
            <div className="flex gap-2 flex-wrap">
              {DAYS_EN.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedDays.includes(i)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {isArabic ? DAYS_AR[i] : day}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? "من الساعة" : "From"}
              </label>
              <input
                type="time"
                value={fromTime}
                onChange={e => setFromTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? "حتى الساعة" : "Until"}
              </label>
              <input
                type="time"
                value={untilTime}
                onChange={e => setUntilTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
            {isArabic
              ? `ستقبلين الطلبات أيام: ${selectedDays.map(d => DAYS_AR[d]).join("، ")} من ${fromTime} حتى ${untilTime}`
              : `Accepting orders: ${selectedDays.map(d => DAYS_EN[d]).join(", ")} from ${fromTime} to ${untilTime}`
            }
          </div>
        </>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60"
      >
        {saving
          ? (isArabic ? "جاري الحفظ..." : "Saving...")
          : success
          ? (isArabic ? "✅ تم الحفظ!" : "✅ Saved!")
          : (isArabic ? "حفظ الجدول" : "Save Schedule")}
      </button>
    </div>
  );
}
