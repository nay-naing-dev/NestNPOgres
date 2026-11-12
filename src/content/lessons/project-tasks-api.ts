import type { Lesson } from '../types'

export const projectTasksApi: Lesson = {
  id: 'project-tasks-api',
  title: 'Mini project ၁ · Tasks API',
  summary:
    'ရှေ့အခန်း ၃ ခန်းမှာ သင်ခဲ့တာအားလုံးကို ပေါင်းပြီး CRUD API အပြည့်အစုံတစ်ခု ဆောက်မယ်။ ဒေတာကို memory ထဲမှာပဲ သိမ်းထားမယ်၊ PostgreSQL နဲ့ချိတ်တာကို mini project ၂ မှာ လုပ်မယ်။',
  minutes: 90,
  blocks: [
    {
      type: 'prose',
      html: `
<h2>ဘာဆောက်မလဲ</h2>
<p>To-do app တစ်ခုရဲ့ backend ပါ။ Frontend developer တစ်ယောက်က ဒီ API ကို သုံးပြီး app ရေးမယ်လို့ စိတ်ကူးပါ။ သူက သင့် code ကို မမြင်ရဘူး၊ အောက်က <strong>API contract</strong> ကိုပဲ ကြည့်ပြီး ရေးမှာ။ ဒါကြောင့် status code နဲ့ response ပုံစံတွေက contract အတိုင်း တိတိကျကျ ဖြစ်ရမယ်။</p>

<h3>API contract</h3>
<table>
<thead><tr><th>Endpoint</th><th>လုပ်ဆောင်ချက်</th><th>အောင်မြင်ရင်</th><th>Error</th></tr></thead>
<tbody>
<tr><td><code>GET /tasks</code></td><td>Task အားလုံး။ <code>?done=true</code> / <code>?done=false</code> နဲ့ filter လုပ်လို့ရ</td><td><code>200</code></td><td><code>400</code></td></tr>
<tr><td><code>GET /tasks/:id</code></td><td>Task တစ်ခု</td><td><code>200</code></td><td><code>400</code>၊ <code>404</code></td></tr>
<tr><td><code>POST /tasks</code> 🔑</td><td>အသစ်ဆောက်</td><td><code>201</code></td><td><code>400</code>၊ <code>401</code></td></tr>
<tr><td><code>PATCH /tasks/:id</code> 🔑</td><td><code>title</code>၊ <code>priority</code>၊ <code>done</code> ထဲက ပါလာတာကိုပဲ ပြင်</td><td><code>200</code></td><td><code>400</code>၊ <code>401</code>၊ <code>404</code></td></tr>
<tr><td><code>DELETE /tasks/:id</code> 🔑</td><td>ဖျက်</td><td><code>204</code> (body မပါ)</td><td><code>401</code>၊ <code>404</code></td></tr>
</tbody>
</table>
<p>🔑 ပါတဲ့ endpoint တွေက <code>x-api-key</code> header လိုတယ်။</p>

<h3>Task ရဲ့ ပုံစံ</h3>`,
    },
    {
      type: 'code',
      lang: 'json',
      file: 'GET /tasks/1 → 200',
      code: `{
  "data": {
    "id": 1,
    "title": "NestJS pipeline ကို လေ့လာ",
    "priority": 2,
    "done": false,
    "createdAt": "2026-11-11T08:30:00.000Z"
  }
}`,
    },
    {
      type: 'prose',
      html: `
<ul>
<li><code>title</code>: မဖြစ်မနေပါရမယ်၊ စာလုံး ၃ လုံးမှ ၈၀ အတွင်း</li>
<li><code>priority</code>: မထည့်လည်းရ၊ 1 မှ 3 အတွင်း ကိန်းပြည့်၊ default က 2</li>
<li><code>id</code>၊ <code>done</code>၊ <code>createdAt</code> ကို server က သတ်မှတ်တယ်။ <code>POST</code> body ထဲမှာ ပါလာရင် လျစ်လျူရှုရမယ်</li>
<li>အောင်မြင်တဲ့ response အားလုံးကို <code>{ "data": ... }</code> နဲ့ ထုပ်ထားရမယ်</li>
</ul>

<h2>ဖိုင်ဖွဲ့စည်းပုံ</h2>`,
    },
    {
      type: 'code',
      lang: 'bash',
      file: 'src/',
      code: `src/
├── main.ts                        # global pipe + interceptor
├── app.module.ts
├── common/
│   ├── api-key.guard.ts
│   └── wrap-response.interceptor.ts
└── tasks/
    ├── tasks.module.ts
    ├── tasks.controller.ts
    ├── tasks.service.ts
    ├── task.entity.ts
    └── dto/
        ├── create-task.dto.ts
        ├── update-task.dto.ts
        └── list-tasks.query.ts`,
    },
    {
      type: 'note',
      tone: 'tip',
      html: 'တစ်ခါတည်း အကုန်မရေးပါနဲ့။ Endpoint တစ်ခုရေး၊ <code>curl</code> နဲ့စမ်း၊ အလုပ်လုပ်မှ နောက်တစ်ခုဆက်ပါ။ အောက်က စာရင်းက အဲဒီအစီအစဉ်အတိုင်း စီထားတယ်။ အမှန်ခြစ်တွေကို browser က မှတ်ထားပေးတယ်။',
    },
    {
      type: 'challenge',
      data: {
        id: 'project-tasks-api',
        title: 'Tasks API ကို contract အတိုင်း ဆောက်ပါ',
        brief:
          '<p>ရှေ့အခန်းတွေက <code>tasks-api</code> project ကို ဆက်သုံးနိုင်တယ်၊ ဒါမှမဟုတ် <code>nest new</code> နဲ့ အသစ်စလည်းရတယ်။ <code>npm i class-validator class-transformer</code> လိုမယ်။</p>',
        requirements: [
          '<code>GET /tasks</code> နဲ့ <code>GET /tasks/:id</code> အလုပ်လုပ်တယ်၊ မရှိတဲ့ id ဆို <code>404</code>',
          '<code>GET /tasks/abc</code> လို id က ဂဏန်းမဟုတ်ရင် <code>400</code> ပြန်တယ် (<code>500</code> မဟုတ်ဘူး)',
          '<code>POST /tasks</code> က DTO နဲ့ validate လုပ်တယ်၊ <code>priority</code> မပါရင် 2 ဖြစ်တယ်',
          '<code>POST</code> body ထဲက <code>id</code>၊ <code>done</code> လို မလိုတဲ့ field တွေက task ထဲ မဝင်ဘူး',
          '<code>PATCH /tasks/:id</code> က ပါလာတဲ့ field တွေကိုပဲ ပြင်တယ်၊ မပါတာတွေ မပြောင်းဘူး',
          '<code>DELETE /tasks/:id</code> က <code>204</code> နဲ့ body ဗလာ ပြန်တယ်',
          '<code>GET /tasks?done=true</code> က ပြီးပြီးသား task တွေကိုပဲ ပြန်တယ်၊ <code>?done=maybe</code> ဆို <code>400</code>',
          'Write endpoint ၃ ခုက <code>x-api-key</code> မမှန်ရင် <code>401</code> ပြန်တယ်၊ <code>GET</code> တွေက key မလိုဘူး',
          'အောင်မြင်တဲ့ response အားလုံး <code>{ "data": ... }</code> ပုံစံဖြစ်တယ် (controller တစ်ခုချင်းမှာ လက်နဲ့မထုပ်ဘဲ interceptor နဲ့)',
          'Controller ထဲမှာ <code>if</code> နဲ့ validation စစ်တာ တစ်ကြောင်းမှ မပါဘူး',
        ],
        hints: [
          '<code>DELETE</code> အတွက် <code>@HttpCode(204)</code> decorator ကိုသုံးပြီး method ကနေ ဘာမှ return မလုပ်ပါနဲ့။',
          'Update DTO မှာ field တိုင်းကို <code>@IsOptional()</code> ထည့်ပါ။ Service ထဲမှာ <code>Object.assign(task, dto)</code> နဲ့ ပါလာတာကိုပဲ ပေါင်းထည့်လို့ရတယ်။ <code>whitelist: true</code> ကြောင့် မလိုတဲ့ field တွေ မပါလာတာ သေချာတယ်။',
          'Query string ကလာတာအားလုံးက string ပါ။ <code>?done=true</code> ကို boolean ပြောင်းဖို့ query DTO မှာ <code>@IsIn([\'true\', \'false\'])</code> နဲ့စစ်ပြီး service ထဲမှာ <code>query.done === \'true\'</code> လို့ နှိုင်းတာက အရိုးရှင်းဆုံး။ <code>@Type(() => Boolean)</code> က <code>"false"</code> ကို <code>true</code> လို့ပြောင်းတတ်လို့ သတိထားပါ။',
          'Guard ကို controller တစ်ခုလုံးမှာ မချိတ်ဘဲ write method ၃ ခုမှာပဲ <code>@UseGuards(ApiKeyGuard)</code> ချိတ်ပါ။',
          'Wrap interceptor မှာ <code>next.handle().pipe(map((data) => ({ data })))</code>။ <code>204</code> အတွက် <code>data</code> က <code>undefined</code> ဖြစ်နေရင် မထုပ်ဘဲ အတိုင်းပြန်ပေးပါ။',
        ],
        solution: [
          {
            file: 'src/tasks/task.entity.ts',
            lang: 'ts',
            code: `export class Task {
  id: number;
  title: string;
  priority: number;
  done: boolean;
  createdAt: Date;
}`,
          },
          {
            file: 'src/tasks/dto/create-task.dto.ts',
            lang: 'ts',
            code: `import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @Length(3, 80)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;
}`,
          },
          {
            file: 'src/tasks/dto/update-task.dto.ts',
            lang: 'ts',
            code: `import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

// @nestjs/mapped-types ရဲ့ PartialType(CreateTaskDto) ကိုသုံးရင် ပိုတိုတယ်။
// ဒီမှာတော့ ဘာဖြစ်နေလဲ မြင်သာအောင် အရှည်ရေးထားတယ်။
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @Length(3, 80)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}`,
          },
          {
            file: 'src/tasks/dto/list-tasks.query.ts',
            lang: 'ts',
            code: `import { IsIn, IsOptional } from 'class-validator';

export class ListTasksQuery {
  @IsOptional()
  @IsIn(['true', 'false'])
  done?: 'true' | 'false';
}`,
          },
          {
            file: 'src/tasks/tasks.service.ts',
            lang: 'ts',
            code: `import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQuery } from './dto/list-tasks.query';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];
  private nextId = 1;

  findAll(query: ListTasksQuery): Task[] {
    if (query.done === undefined) return this.tasks;
    const done = query.done === 'true';
    return this.tasks.filter((t) => t.done === done);
  }

  findOne(id: number): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException('Task ' + id + ' not found');
    return task;
  }

  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: this.nextId++,
      title: dto.title,
      priority: dto.priority ?? 2,
      done: false,
      createdAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  update(id: number, dto: UpdateTaskDto): Task {
    const task = this.findOne(id); // မရှိရင် ဒီမှာတင် 404 ပစ်တယ်
    Object.assign(task, dto);
    return task;
  }

  remove(id: number): void {
    this.findOne(id);
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }
}`,
          },
          {
            file: 'src/tasks/tasks.controller.ts',
            lang: 'ts',
            code: `import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQuery } from './dto/list-tasks.query';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll(@Query() query: ListTasksQuery) {
    return this.tasks.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.findOne(id);
  }

  @UseGuards(ApiKeyGuard)
  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto);
  }

  @UseGuards(ApiKeyGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.tasks.remove(id);
  }
}`,
          },
          {
            file: 'src/common/wrap-response.interceptor.ts',
            lang: 'ts',
            code: `import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => (data === undefined ? data : { data })));
  }
}`,
          },
          {
            file: 'src/common/api-key.guard.ts',
            lang: 'ts',
            code: `import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers['x-api-key'] !== (process.env.API_KEY ?? 'dev-secret')) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}`,
          },
          {
            file: 'src/main.ts',
            lang: 'ts',
            code: `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WrapResponseInterceptor } from './common/wrap-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new WrapResponseInterceptor());
  await app.listen(3000);
}
bootstrap();`,
          },
        ],
      },
    },
    {
      type: 'prose',
      html: `
<h2>ပြီးရင် ကိုယ့်ကိုယ်ကို မေးကြည့်ပါ</h2>
<ul>
<li>Server ကို restart လုပ်လိုက်ရင် task တွေ ဘာဖြစ်သွားလဲ။ Server ၂ လုံး run ထားရင်ကော။ ဒါက database လိုအပ်တဲ့ အကြောင်းရင်းပါ။</li>
<li><code>TasksService</code> ထဲမှာ HTTP နဲ့ဆိုင်တာ ဘာတွေပါနေလဲ။ (<code>NotFoundException</code> တစ်ခုပဲ ရှိသင့်တယ်။ အဲဒါကိုတောင် domain error အဖြစ်ခွဲပြီး filter နဲ့ပြောင်းတဲ့နည်းကို နောက်ပိုင်းမှာ တွေ့ရမယ်။)</li>
<li>Task ၁ သိန်းရှိလာရင် <code>GET /tasks</code> က ဘာဖြစ်မလဲ။ Pagination အခန်းမှာ ဖြေရှင်းမယ်။</li>
</ul>`,
    },
  ],
}
