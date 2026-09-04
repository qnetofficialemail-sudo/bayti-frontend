path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\components\ScheduleSettings.tsx'
content = open(path, encoding='utf-8').read()

old = '''export default function ScheduleSettings({ seller, onUpdate }: Props) {
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
  const [useSchedule, setUseSchedule] = useState(!!(seller?.available_days || seller?.available_from));'''

new = '''export default function ScheduleSettings({ seller, onUpdate }: Props) {
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

  // Sync state when seller prop updates (after save)
  React.useEffect(() => {
    setSelectedDays(parseDays(seller?.available_days));
    setFromTime(seller?.available_from || "09:00");
    setUntilTime(seller?.available_until || "21:00");
    setAccepting(seller?.accepting_orders !== false);
    setUseSchedule(!!(seller?.available_days || seller?.available_from));
  }, [seller?.available_days, seller?.available_from, seller?.available_until, seller?.accepting_orders]);'''

if old in content:
    content = content.replace(old, new)
    # Add React import if not there
    if "import React" not in content:
        content = 'import React from "react";\n' + content
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ ScheduleSettings.tsx fixed - state now syncs with seller prop")
else:
    print("❌ Pattern not found")
