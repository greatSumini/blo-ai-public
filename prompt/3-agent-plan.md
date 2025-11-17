글 작성 기능을 단순 일회성 생성에서, 에이전트(AI 채팅 + tool call) 방식으로 수정해주세요.
useCompletion 대신 useChat hook을 활용하도록 수정해야합니다.
하단 참고 문서 코드를 반드시 따르세요.
gemini-2.5-pro 모델을 사용하세요.

## 수정 개요

- AS-IS: 작성할 글 주제를 입력하고, 브랜딩 선택 후 제출하면 글이 바로 생성된다.
- TO-BE: 작성할 글 주제를 입력하고, 브랜딩 선택 후 제출하면 하단에 대화창이 시작되며, 다음과 같이 진행한다. keywords state에 입력된 키워드 목록을 저장해둔다. 진행 단계를 상단에 stepper ui로 표시한다. 메세지 정렬은 user가 오른쪽, assistant가 왼쪽으로한다.

  0. user: form 제출 후 즉시 '글 작성을 시작해주세요.'라는 메세지가 전송된다.
  1. assistant: 생성할 글 주제/브랜딩을 짧게 브리핑하고 맞는지 확인 요청한다.
  2. user: 맞으면 글 작성을 요청한다.
  3. assistant: keywords 목록이 비어있다면, set_main_keyword tool을 호출해 메인 키워드를 설정한다.

  - 입력된 주제를 참고해 AI가 자동으로 가장 유력한 검색어를 선택한다.
  - keywords 목록에 추가된다.

  4. assistant: suggest_keywords tool을 호출해, longtail 키워드 목록을 가져온다.

  - keywords[0]을 기반으로 dataforseo api를 호출한다.
  - 가져온 결과는 keywords 목록에 append한다.

  5. assistant: naver_search_blog tool을 호출해, keywords[0:3]에 대한 상위 검색 결과를 가져온다.

  - keywords[0:3]에 대한 상위 검색 결과를 가져온다.

  6. assistant: 글 작성을 위해 필요한 전문 지식 및 추가 정보를 list up하고, brave_search tool을 호출해 검색한다.
  7. assistant: set_metadata tool을 호출해, 해당 글의 SEO 최적화를 위한 메타 데이터를 state에 설정한다.
  8. assistant: set_content tool을 호출해, 해당 글의 본문을 state에 설정한다.

  set_content tool이 완료되면, 데이터베이스에 해당 글 정보를 저장하고, '글 작성이 완료되었습니다.'라는 메세지가 출력되며 대화목록view가 비활성화 상태가 된다.
  그리고 하단에 완성된 메타데이터 및 본문이 출력된다. '완료하기'를 누르면 해당 글의 상세페이지로 이동한다.

## tool별 요구사항

- set_main_keyword tool
  - input: keyword (string)
  - output: 'main keyword set' (string)
- suggest_keywords tool (dataforseo.ts의 함수 활용)
  - input: keyword (string)
  - output: 연관 키워드 목록 (array of object)
    - keyword: string;
    - competition: number;
    - volume: number;
    - cpc: number;
- naver_search_blog tool (naver_serarch.ts의 함수 활용)
  - input: keyword (string)
  - output: 상위 검색 결과 (array of object)
    - title: string;
    - description: string;
- brave_search tool (brave_search.ts의 함수 활용)
  - input: query (string)
  - output: 상위 검색 결과 (array of object)
    - title: string;
    - description: string;
    - published: string;
    - rank: number;
- set_metadata tool
  - input: metadata (object)
    - title: string;
    - slug: string;
    - description: string;
    - keywords: array of string;
    - headings: array of string;
  - output: 'metadata set' (string)
- set_content tool
  - input: content (string)
  - output: 'content set' (string)

## 주의사항

- AI API는 기존의 것을 수정하여 작업하세요.
- client, server 모두 빠지지 않게 작업하세요.
- tool 호출 중, 호출 완료 UI를 적절히 대화목록view에 표시하세요.
- 각 tool의 호출여부를 상태로 관리하고, 이전단계 tool들이 완료되어야 다음 단계 tool을 호출할 수 있도록 하세요.
- server side tool과 client side tool을 구분하여 작업하세요. state를 설정한다면 client side tool입니다.
- 여러번 호출되면 안되는 로직은 절대 useEffect를 사용하지말고, 이벤트 핸들러에서 함수를 직접 호출하세요.
- 아이콘은 emoji 대신 lucide-react 아이콘을 사용하세요.
- 미니멀한 claude 스타일 UI로 구현하세요.
- 타입 에러가 발생한다면, 참고 문서를 제대로 따르지 않았을 확률이 높습니다. 다시 한번 참고 문서를 확인하고 정확히 구현했는지 점검하세요.
- AI 응답이 생성중일땐 로딩상태를 적절히 표시하세요.
- 역할별로 파일을 적절히 나누세요.
- tool에 에러핸들링을 철저히 하세요. 실패해도 적절한 응답을 반환하세요.
- 완료된 tool에 output이 존재한다면 적절히 표시하세요.
- AI가 생각중일땐 로딩상태를 적절히 표시하세요.
- assistant가 마크다운으로 응답하게하고, 적절히 포맷팅해 표시하세요.

## 에이전트 구현 참고 문서

주어진 코드를 자세히 파악하고, 반드시 따르세요.

### Client - `useChat` hook 활용

```
'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useState } from 'react';
import { ChatMessage } from './api/chat/route';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, addToolOutput } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            topic,
            brandingId,
          },
        };
      },
    }),

    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'getLocation') {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'San Francisco'];

        // No await - avoids potential deadlocks
        addToolOutput({
          tool: 'getLocation',
          toolCallId: toolCall.toolCallId,
          output: cities[Math.floor(Math.random() * cities.length)],
        });
      }
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch gap-4">
      {messages?.map(m => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-1">
          <strong>{`${m.role}: `}</strong>
          {m.parts?.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={m.id + i}>{part.text}</div>;
              // render confirmation tool (client-side tool with user interaction)
              case 'tool-askForConfirmation':
                return (
                  <div
                    key={part.toolCallId}
                    className="text-gray-500 flex flex-col gap-2"
                  >
                    <div className="flex gap-2">
                      {part.state === 'output-available' ? (
                        <b>{part.output}</b>
                      ) : (
                        <>
                          <button
                            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                            onClick={() =>
                              addToolOutput({
                                tool: 'askForConfirmation',
                                toolCallId: part.toolCallId,
                                output: 'Yes, confirmed.',
                              })
                            }
                          >
                            Yes
                          </button>
                          <button
                            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                            onClick={() =>
                              addToolOutput({
                                tool: 'askForConfirmation',
                                toolCallId: part.toolCallId,
                                output: 'No, denied',
                              })
                            }
                          >
                            No
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );

              // other tools:
              case 'tool-getWeatherInformation':
                if (part.state === 'output-available') {
                  return (
                    <div
                      key={part.toolCallId}
                      className="flex flex-col gap-2 p-4 bg-blue-400 rounded-lg"
                    >
                      <div className="flex flex-row justify-between items-center">
                        <div className="text-4xl text-blue-50 font-medium">
                          {part.output.value}°
                          {part.output.unit === 'celsius' ? 'C' : 'F'}
                        </div>

                        <div className="h-9 w-9 bg-amber-400 rounded-full flex-shrink-0" />
                      </div>
                      <div className="flex flex-row gap-2 text-blue-50 justify-between">
                        {part.output.weeklyForecast.map(forecast => (
                          <div
                            key={forecast.day}
                            className="flex flex-col items-center"
                          >
                            <div className="text-xs">{forecast.day}</div>
                            <div>{forecast.value}°</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                break;
              case 'tool-getLocation':
                if (part.state === 'output-available') {
                  return (
                    <div
                      key={part.toolCallId}
                      className="text-gray-500 bg-gray-100 rounded-lg p-4"
                    >
                      User is in {part.output}.
                    </div>
                  );
                } else {
                  return (
                    <div key={part.toolCallId} className="text-gray-500">
                      Calling getLocation...
                    </div>
                  );
                }

              default:
                break;
            }
          })}
        </div>
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
```

#### `useChat`에 custom body 전달하는 법

```
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            id,
            message: messages[messages.length - 1],
          },
        };
      },
    }),
  });
```

#### Server - vercel ai sdk v5 활용

```
import { openai } from '@ai-sdk/openai';
import {
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from 'ai';
import { z } from 'zod';

const tools = {
  getWeatherInformation: tool({
    description: 'show the weather in a given city to the user',
    inputSchema: z.object({ city: z.string() }),
    execute: async ({}: { city: string }) => {
      return {
        value: 24,
        unit: 'celsius',
        weeklyForecast: [
          { day: 'Monday', value: 24 },
          { day: 'Tuesday', value: 25 },
          { day: 'Wednesday', value: 26 },
          { day: 'Thursday', value: 27 },
          { day: 'Friday', value: 28 },
          { day: 'Saturday', value: 29 },
          { day: 'Sunday', value: 30 },
        ],
      };
    },
  }),
  // client-side tool that starts user interaction:
  askForConfirmation: tool({
    description: 'Ask the user for confirmation.',
    inputSchema: z.object({
      message: z.string().describe('The message to ask for confirmation.'),
    }),
  }),
  // client-side tool that is automatically executed on the client:
  getLocation: tool({
    description:
      'Get the user location. Always ask for confirmation before using this tool.',
    inputSchema: z.object({}),
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(request: Request) {
  const { messages }: { messages: ChatMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-4.1'),
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
```
