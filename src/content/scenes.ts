import type { FlowScene } from './types'

/** Compact loop shown on the home page: one request, there and back. */
export const heroScene: FlowScene = {
  title: 'Request တစ်ခုရဲ့ ခရီးစဉ်',
  width: 900,
  height: 96,
  nodes: [
    { id: 'client', label: 'Client', x: 6, y: 20, w: 110, kind: 'client' },
    { id: 'guard', label: 'Guard', x: 162, y: 20, w: 110, kind: 'nest' },
    { id: 'pipe', label: 'Pipe', x: 318, y: 20, w: 110, kind: 'nest' },
    { id: 'ctrl', label: 'Controller', x: 474, y: 20, w: 110, kind: 'nest' },
    { id: 'svc', label: 'Service', x: 630, y: 20, w: 110, kind: 'nest' },
    { id: 'pg', label: 'PostgreSQL', x: 786, y: 20, w: 110, kind: 'pg' },
  ],
  edges: [
    ['client', 'guard'],
    ['guard', 'pipe'],
    ['pipe', 'ctrl'],
    ['ctrl', 'svc'],
    ['svc', 'pg'],
  ],
  scenarios: [
    {
      id: 'loop',
      label: 'loop',
      steps: [
        { from: 'client', to: 'guard', packet: 'POST /tasks', title: 'Guard က ဒီ request ကို ဝင်ခွင့်ပေးမလား စစ်တယ်', note: '' },
        { from: 'guard', to: 'pipe', packet: 'POST /tasks', title: 'Pipe က body ကို DTO အဖြစ်ပြောင်းပြီး validate လုပ်တယ်', note: '' },
        { from: 'pipe', to: 'ctrl', packet: 'CreateTaskDto', title: 'Controller က route နဲ့ကိုက်တဲ့ method ကို ခေါ်တယ်', note: '' },
        { from: 'ctrl', to: 'svc', packet: 'create(dto)', title: 'Service က business logic ကို လုပ်တယ်', note: '' },
        { from: 'svc', to: 'pg', packet: 'INSERT', tone: 'data', title: 'PostgreSQL ထဲ row အသစ်တစ်ခု ရောက်သွားတယ်', note: '' },
        { from: 'pg', to: 'svc', packet: '1 row', tone: 'data', title: 'Database က သိမ်းလိုက်တဲ့ row ကို ပြန်ပေးတယ်', note: '' },
        { from: 'svc', to: 'ctrl', packet: 'Task', tone: 'res', title: 'Service က Task object ကို ပြန်ပေးတယ်', note: '' },
        { from: 'ctrl', to: 'client', packet: '201 Created', tone: 'res', title: 'Client ဆီ JSON response ပြန်ရောက်တယ်', note: '' },
      ],
    },
  ],
}
