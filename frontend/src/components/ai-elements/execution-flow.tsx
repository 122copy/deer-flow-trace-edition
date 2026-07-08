"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  Loader2Icon,
  ListTodoIcon,
  MessageSquareIcon,
  PlayCircleIcon,
  BoxIcon,
  EyeIcon,
  SendHorizontalIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

import type { ExecutionStep, NodeExecutionDetail } from "@/core/execution/api";
import {
  getExecutionDetail,
  getExecutionHistory,
} from "@/core/execution/api";

interface ExecutionFlowProps {
  threadId: string;
  isLoading?: boolean;
}

export function ExecutionFlow({
  threadId,
  isLoading,
}: ExecutionFlowProps) {
  const { t } = useI18n();
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<ExecutionStep | null>(null);
  const [stepDetail, setStepDetail] = useState<NodeExecutionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const getNodeType = (nodeName: string | null) => {
    if (!nodeName) return "unknown";
    if (nodeName.includes("Middleware")) {
      const lower = nodeName.toLowerCase();
      if (lower.includes("threaddata") || lower.includes("uploads") || (lower.includes("sandbox") && !lower.includes("view"))) {
        return "before_agent";
      }
      if (lower.includes("viewimage")) {
        return "before_model";
      }
      if (lower.includes("dangling") || lower.includes("summarization") || lower.includes("todo") || 
          lower.includes("title") || lower.includes("subagentlimit") || lower.includes("loopdetection") || 
          lower.includes("clarification")) {
        return "after_model";
      }
      if (lower.includes("memory") || lower.includes("guardrail") || lower.includes("toolerrorhandling") || 
          (lower.includes("sandbox") && !lower.includes("view"))) {
        return "after_agent";
      }
      return "middleware";
    }
    if (nodeName.includes("agent")) return "agent";
    if (nodeName.includes("tool")) return "tool";
    if (nodeName.includes("model") || nodeName.includes("llm")) return "model";
    return "node";
  };

  const filterOptions = [
    { value: "all", label: t.execution.all || "All" },
    { value: "tool", label: t.execution.tool || "Tool" },
    { value: "model", label: t.execution.model || "Model" },
    { value: "before_agent", label: t.execution.beforeAgent || "Before Agent" },
    { value: "before_model", label: t.execution.beforeModel || "Before Model" },
    { value: "after_model", label: t.execution.afterModel || "After Model" },
    { value: "after_agent", label: t.execution.afterAgent || "After Agent" },
    { value: "node", label: t.execution.node || "Node" },
    { value: "unknown", label: t.execution.unknown || "Unknown" },
  ];

  const filteredSteps = steps.filter((step) => {
    if (filterType === "all") return true;
    const nodeType = getNodeType(step.node);
    return nodeType === filterType;
  });

  useEffect(() => {
    if (!threadId) return;

    getExecutionHistory(threadId)
      .then((data) => {
        setSteps(data.steps.reverse());
      })
      .catch(console.error);
  }, [threadId, isLoading]);

  useEffect(() => {
    if (!selectedStep || !selectedStep.checkpoint_id) return;

    setDetailLoading(true);
    getExecutionDetail(threadId, selectedStep.checkpoint_id)
      .then((data) => {
        setStepDetail(data);
      })
      .catch(console.error)
      .finally(() => {
        setDetailLoading(false);
      });
  }, [selectedStep, threadId]);

  const getStatusIcon = (status: string, index: number) => {
    if (status === "completed") {
      return <CheckCircleIcon className="size-4 text-green-500" />;
    } else if (status === "failed") {
      return <XCircleIcon className="size-4 text-red-500" />;
    } else if (index === steps.length - 1 && isLoading) {
      return <Loader2Icon className="size-4 animate-spin text-blue-500" />;
    }
    return <ClockIcon className="size-4 text-muted-foreground" />;
  };

  const getNodeBadgeVariant = (nodeName: string | null) => {
    const type = getNodeType(nodeName);
    switch (type) {
      case "before_agent":
        return "default";
      case "before_model":
        return "secondary";
      case "after_model":
        return "outline";
      case "after_agent":
        return "destructive";
      case "agent":
        return "default";
      case "tool":
        return "secondary";
      case "model":
        return "outline";
      default:
        return "outline";
    }
  };

  if (steps.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Collapsible className="w-full" open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <ActivityIcon className="size-4" />
            <span className="text-sm font-medium">
              {t.execution.title || "Execution Flow"}
            </span>
            <Badge variant="outline" className="ml-2">
              {filteredSteps.length} {t.execution.steps || "steps"}
            </Badge>
          </div>
          <ChevronRightIcon
            className={cn(
              "size-4 transition-transform",
              open && "rotate-90"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex gap-4 pt-2">
          <div className="flex w-1/3 flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">
                {t.execution.filter || "Filter"}:
              </span>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilterType(option.value)}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs transition-colors",
                    filterType === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <ScrollArea className="h-[1000px] rounded-md border">
              <div className="p-2">
                {filteredSteps.map((step, index) => (
                  <button
                    key={step.checkpoint_id || index}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-accent",
                      selectedStep?.checkpoint_id === step.checkpoint_id &&
                        "bg-accent"
                    )}
                    onClick={() => setSelectedStep(step)}
                  >
                    {getStatusIcon(step.status, index)}
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium">
                        {step.node || t.execution.waiting || "Waiting..."}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.execution.step || "Step"} {step.step}
                      </div>
                    </div>
                    <Badge variant={getNodeBadgeVariant(step.node)} className="text-xs">
                      {getNodeType(step.node)}
                    </Badge>
                  </button>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 p-2 text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" />
                    <span className="text-sm">{t.execution.running || "Running..."}</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <ScrollArea className="h-[1000px] min-w-0 w-2/3 rounded-md border">
            <div className="p-4">
              {detailLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2Icon className="size-6 animate-spin" />
                </div>
              ) : stepDetail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <PlayCircleIcon className="size-5 text-blue-500" />
                    <h3 className="font-semibold">
                      {stepDetail.node_name || "Unknown Node"}
                    </h3>
                    <Badge variant="outline">
                      {getNodeType(stepDetail.node_name)}
                    </Badge>
                  </div>

                  {stepDetail.created_at && (
                    <div className="text-sm text-muted-foreground" suppressHydrationWarning>
                      <ClockIcon className="mr-1 inline size-3" />
                      {new Date(stepDetail.created_at).toLocaleString()}
                    </div>
                  )}

                  {stepDetail.output_data && (
                    <OutputDataViewer data={stepDetail.output_data} />
                  )}

                  {stepDetail.metadata && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium">
                        {t.execution.metadata || "Metadata"}
                      </h4>
                      <pre className="h-[300px] overflow-auto rounded-md bg-muted p-2 text-xs">
                        {JSON.stringify(stepDetail.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <span className="text-sm">
                    {t.execution.selectStep || "Select a step to view details"}
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface OutputDataViewerProps {
  data: Record<string, unknown>;
}

function OutputDataViewer({ data }: OutputDataViewerProps) {
  const { t } = useI18n();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["messages", "todos", "artifacts", "title", "other"]));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const messages = data.messages as Array<Record<string, unknown>> | undefined;
  const todos = data.todos as Array<Record<string, unknown>> | undefined;
  const artifacts = data.artifacts as string[] | undefined;
  const title = data.title as string | undefined;
  const sandbox = data.sandbox as Record<string, unknown> | undefined;
  const threadData = data.thread_data as Record<string, unknown> | undefined;
  const uploadedFiles = data.uploaded_files as Array<Record<string, unknown>> | undefined;
  const viewedImages = data.viewed_images as Record<string, unknown> | undefined;
  const otherKeys = Object.keys(data).filter(
    (key) => !["messages", "todos", "artifacts", "title", "sandbox", "thread_data", "uploaded_files", "viewed_images"].includes(key)
  );

  const renderMessage = (msg: Record<string, unknown>, index: number) => {
    const msgType = msg.type as string;
    const content = msg.content;
    const toolCalls = msg.tool_calls as Array<Record<string, unknown>> | undefined;
    const toolCallId = msg.tool_call_id as string | undefined;
    const additionalKwargs = msg.additional_kwargs as Record<string, unknown> | undefined;
    const [isExpanded, setIsExpanded] = useState(false);

    const getContentPreview = () => {
      if (!content) return "empty";
      if (Array.isArray(content)) {
        const texts = content
          .filter((item) => typeof item === "object" && item !== null && (item as Record<string, unknown>).text)
          .map((item) => String((item as Record<string, unknown>).text))
          .join(" ");
        return texts.length > 100 ? texts.slice(0, 100) + "..." : texts;
      }
      return String(content).slice(0, 100);
    };

    const preview = getContentPreview();
    const hasToolCalls = toolCalls && toolCalls.length > 0;
    const hasAdditionalKwargs = additionalKwargs && Object.keys(additionalKwargs).length > 0;
    const hasToolCallId = !!toolCallId;

    const getMsgTypeColor = (type: string) => {
      switch (type) {
        case "human": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        case "ai": return "bg-green-500/10 text-green-600 border-green-500/20";
        case "tool": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
        case "system": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
        default: return "bg-muted text-muted-foreground border-muted";
      }
    };

    return (
      <div key={`msg-${index}`} className="mb-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center gap-2 rounded-md border bg-card p-2 transition-colors hover:bg-muted/50"
        >
          <ChevronRightIcon
            className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-90")}
          />
          <Badge variant="outline" className={cn("text-xs shrink-0", getMsgTypeColor(msgType))}>
            {msgType}
          </Badge>
          <span className="text-xs text-muted-foreground shrink-0">#{index + 1}</span>
          <span className="flex-1 truncate text-left text-xs text-foreground/80">
            {preview}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {hasToolCalls && (
              <Badge variant="secondary" className="text-xs">
                {toolCalls!.length} tools
              </Badge>
            )}
            {hasToolCallId && (
              <Badge variant="outline" className="text-xs">
                result
              </Badge>
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="mt-1 rounded-md border bg-card p-3">
            {content && (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  {t.execution.content || "Content"}:
                </div>
                {Array.isArray(content) ? (
                  content.map((item, i) => {
                    if (typeof item === "object" && item !== null) {
                      const itemTyped = item as Record<string, unknown>;
                      return (
                        <div key={i} className="ml-2 rounded bg-muted/50 p-2 text-xs">
                          {itemTyped.type && (
                            <div className="mb-1">
                              <span className="font-medium text-muted-foreground">type:</span> {String(itemTyped.type)}
                            </div>
                          )}
                          {itemTyped.text && (
                            <pre className="whitespace-pre-wrap">{String(itemTyped.text)}</pre>
                          )}
                          {itemTyped.url && (
                            <div className="text-blue-600">
                              <span className="font-medium text-muted-foreground">url:</span> {String(itemTyped.url)}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return <div key={i}>{String(item)}</div>;
                  })
                ) : (
                  <pre className="whitespace-pre-wrap text-xs">{String(content)}</pre>
                )}
              </div>
            )}

            {toolCalls && toolCalls.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  {t.execution.toolCalls || "Tool Calls"} ({toolCalls.length}):
                </div>
                {toolCalls.map((tc, i) => (
                  <div key={i} className="mb-2 ml-2 rounded bg-secondary/50 p-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        {String(tc.name || tc.name)}
                      </span>
                      {tc.id && (
                        <span className="text-xs text-muted-foreground">#{String(tc.id).slice(0, 8)}</span>
                      )}
                    </div>
                    {tc.args && (
                      <pre className="mt-1 max-h-[150px] overflow-auto text-xs">{JSON.stringify(tc.args, null, 2)}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}

            {toolCallId && (
              <div className="mb-2 text-xs">
                <span className="font-medium text-muted-foreground">tool_call_id:</span>{" "}
                <span className="rounded bg-secondary px-1">{toolCallId}</span>
              </div>
            )}

            {additionalKwargs && Object.keys(additionalKwargs).length > 0 && (
              <div className="text-xs">
                <div className="mb-1 font-medium text-muted-foreground">additional_kwargs:</div>
                <pre className="max-h-[100px] overflow-auto text-xs">{JSON.stringify(additionalKwargs, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (
    title: string,
    key: string,
    icon: React.ReactNode,
    count: number,
    content: React.ReactNode,
    variant?: "default" | "secondary" | "outline" | "destructive"
  ) => {
    const isExpanded = expandedSections.has(key);
    return (
      <div className="mb-3">
        <button
          type="button"
          onClick={() => toggleSection(key)}
          className="flex w-full items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
            <Badge variant={variant || "outline"} className="text-xs">
              {count}
            </Badge>
          </div>
          <ChevronRightIcon
            className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
          />
        </button>
        {isExpanded && <div className="mt-2">{content}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">
        {t.execution.output || "Output"} - {Object.keys(data).length} {t.execution.fields || "fields"}
      </h4>
      
      {messages && messages.length > 0 && renderSection(
        t.execution.messages || "Messages",
        "messages",
        <MessageSquareIcon className="size-4" />,
        messages.length,
        <div className="space-y-1">{messages.map((msg, i) => renderMessage(msg, i))}</div>
      )}

      {todos && todos.length > 0 && renderSection(
        t.execution.todos || "Todos",
        "todos",
        <ListTodoIcon className="size-4" />,
        todos.length,
        <div className="space-y-1">
          {todos.map((todo, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md bg-card p-2 text-xs">
              <span className={cn("size-2 rounded-full", todo.status === "completed" ? "bg-green-500" : "bg-yellow-500")} />
              <span className={cn(todo.status === "completed" && "line-through text-muted-foreground")}>
                {String(todo.content || todo.title || todo.description || `Todo ${i + 1}`)}
              </span>
              {todo.id && <span className="ml-auto text-muted-foreground">#{String(todo.id).slice(0, 8)}</span>}
            </div>
          ))}
        </div>,
        "default"
      )}

      {artifacts && artifacts.length > 0 && renderSection(
        t.execution.artifacts || "Artifacts",
        "artifacts",
        <FileTextIcon className="size-4" />,
        artifacts.length,
        <div className="space-y-1">
          {artifacts.map((artifact, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md bg-card p-2 text-xs">
              <BoxIcon className="size-3 text-muted-foreground" />
              <span className="truncate">{artifact}</span>
            </div>
          ))}
        </div>,
        "secondary"
      )}

      {title && (
        <div className="mb-3 rounded-md bg-card p-3">
          <div className="mb-1 flex items-center gap-2">
            <EyeIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t.execution.threadTitle || "Title"}</span>
          </div>
          <p className="text-sm">{title}</p>
        </div>
      )}

      {uploadedFiles && uploadedFiles.length > 0 && renderSection(
        t.execution.uploadedFiles || "Uploaded Files",
        "uploaded_files",
        <SendHorizontalIcon className="size-4" />,
        uploadedFiles.length,
        <div className="space-y-1">
          {uploadedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md bg-card p-2 text-xs">
              <span className="truncate">{String(file.filename || file.name || `File ${i + 1}`)}</span>
              {file.size !== undefined && <span className="ml-auto text-muted-foreground">{(Number(file.size) / 1024).toFixed(1)} KB</span>}
            </div>
          ))}
        </div>,
        "outline"
      )}

      {viewedImages && Object.keys(viewedImages).length > 0 && renderSection(
        t.execution.viewedImages || "Viewed Images",
        "viewed_images",
        <EyeIcon className="size-4" />,
        Object.keys(viewedImages).length,
        <div className="space-y-1">
          {Object.entries(viewedImages).map(([path, imgData]) => (
            <div key={path} className="flex items-center gap-2 rounded-md bg-card p-2 text-xs">
              <span className="truncate">{path}</span>
              {typeof imgData === "object" && imgData !== null && (
                <span className="ml-auto text-muted-foreground">
                  {(imgData as Record<string, unknown>).mime_type || "image"}
                </span>
              )}
            </div>
          ))}
        </div>,
        "outline"
      )}

      {sandbox && (
        <div className="mb-3 rounded-md bg-card p-3">
          <div className="mb-2 flex items-center gap-2">
            <BoxIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t.execution.sandbox || "Sandbox"}</span>
          </div>
          <pre className="overflow-auto text-xs">{JSON.stringify(sandbox, null, 2)}</pre>
        </div>
      )}

      {threadData && (
        <div className="mb-3 rounded-md bg-card p-3">
          <div className="mb-2 flex items-center gap-2">
            <BoxIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t.execution.threadData || "Thread Data"}</span>
          </div>
          <pre className="overflow-auto text-xs">{JSON.stringify(threadData, null, 2)}</pre>
        </div>
      )}

      {otherKeys.length > 0 && renderSection(
        t.execution.other || "Other Data",
        "other",
        <BoxIcon className="size-4" />,
        otherKeys.length,
        <div className="space-y-1">
          {otherKeys.map((key) => {
            const value = data[key];
            const isBranchData = key.startsWith("branch:to:");
            const isPregelTasks = key === "__pregel_tasks";
            const isStart = key === "__start__";
            
            return (
              <div key={key} className="rounded-md bg-card p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium">{key}</span>
                  {isBranchData && (
                    <Badge variant="outline" className="text-xs">middleware</Badge>
                  )}
                  {isPregelTasks && (
                    <Badge variant="secondary" className="text-xs">tasks</Badge>
                  )}
                  {isStart && (
                    <Badge variant="outline" className="text-xs">start</Badge>
                  )}
                </div>
                {isBranchData && value !== null && typeof value === "object" ? (
                  <div className="space-y-1">
                    {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                      <div key={k} className="ml-2 border-l-2 border-muted-foreground/20 pl-2">
                        <span className="text-xs font-medium text-muted-foreground">{k}:</span>
                        <pre className="mt-1 max-h-[100px] overflow-auto text-xs">
                          {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : isPregelTasks && Array.isArray(value) ? (
                  <div className="space-y-1">
                    {value.map((task, i) => (
                      <div key={i} className="ml-2 rounded bg-secondary/50 p-2 text-xs">
                        <span className="font-medium">Task #{i + 1}</span>
                        <pre className="mt-1 overflow-auto">{JSON.stringify(task, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="max-h-[200px] overflow-auto text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>,
        "secondary"
      )}

      {Object.keys(data).length === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {t.execution.noData || "No output data"}
        </div>
      )}
    </div>
  );
}
