import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/execution", tags=["execution"])


class ExecutionStep(BaseModel):
    step: int
    node: str | None
    checkpoint_id: str | None
    created_at: str | None
    next_nodes: list[str]
    status: str


class ExecutionHistoryResponse(BaseModel):
    thread_id: str
    steps: list[ExecutionStep]


async def _get_langgraph_client():
    from langgraph_sdk import get_client
    return get_client(url="http://langgraph:2024")


@router.get("/history/{thread_id}", response_model=ExecutionHistoryResponse)
async def get_execution_history(thread_id: str) -> ExecutionHistoryResponse:
    """Get the execution history (state snapshots) for a thread."""
    try:
        client = await _get_langgraph_client()
        history = await client.threads.get_history(thread_id, limit=1000)
        
        steps = []
        for idx, snapshot in enumerate(history):
            next_nodes = list(snapshot.get("next", []) or [])
            metadata = snapshot.get("metadata", {}) or {}
            
            step = ExecutionStep(
                step=metadata.get("step", idx),
                node=next_nodes[0] if next_nodes else None,
                checkpoint_id=snapshot.get("checkpoint_id"),
                created_at=snapshot.get("created_at"),
                next_nodes=next_nodes,
                status="completed" if not next_nodes else "in_progress"
            )
            steps.append(step)
        
        return ExecutionHistoryResponse(thread_id=thread_id, steps=steps)
    except Exception as e:
        error_detail = str(e)
        if "Thread with ID" in error_detail and "not found" in error_detail:
            return ExecutionHistoryResponse(thread_id=thread_id, steps=[])
        logger.exception(f"Failed to get execution history for thread {thread_id}")
        raise HTTPException(status_code=500, detail=str(e)) from e


class NodeExecutionDetail(BaseModel):
    node_name: str
    checkpoint_id: str
    created_at: str | None
    input_data: dict[str, Any] | None
    output_data: dict[str, Any] | None
    metadata: dict[str, Any] | None


@router.get("/detail/{thread_id}/{checkpoint_id}", response_model=NodeExecutionDetail)
async def get_node_execution_detail(thread_id: str, checkpoint_id: str) -> NodeExecutionDetail:
    """Get detailed execution information for a specific checkpoint.
    
    Returns the values from the NEXT checkpoint in the history (which represents the output of this step).
    Note: get_history returns in reverse chronological order (newest first), so we need to account for that.
    """
    try:
        client = await _get_langgraph_client()
        
        history = await client.threads.get_history(thread_id, limit=1000)
        
        current_index = None
        for idx, snapshot in enumerate(history):
            if snapshot.get("checkpoint_id") == checkpoint_id:
                current_index = idx
                break
        
        if current_index is None:
            state = await client.threads.get_state(thread_id, checkpoint_id=checkpoint_id)
            if not state:
                raise HTTPException(status_code=404, detail="Checkpoint not found")
            snapshot = state
            next_nodes = list(snapshot.get("next", []) or [])
            return NodeExecutionDetail(
                node_name=next_nodes[0] if next_nodes else "unknown",
                checkpoint_id=checkpoint_id,
                created_at=snapshot.get("created_at"),
                input_data=None,
                output_data=snapshot.get("values"),
                metadata=snapshot.get("metadata")
            )
        
        if current_index > 0:
            next_snapshot = history[current_index - 1]
            next_nodes = list(next_snapshot.get("next", []) or [])
            return NodeExecutionDetail(
                node_name=next_nodes[0] if next_nodes else "unknown",
                checkpoint_id=checkpoint_id,
                created_at=next_snapshot.get("created_at"),
                input_data=None,
                output_data=next_snapshot.get("values"),
                metadata=next_snapshot.get("metadata")
            )
        
        state = await client.threads.get_state(thread_id, checkpoint_id=checkpoint_id)
        if not state:
            raise HTTPException(status_code=404, detail="Checkpoint not found")
        
        snapshot = state
        next_nodes = list(snapshot.get("next", []) or [])
        
        return NodeExecutionDetail(
            node_name=next_nodes[0] if next_nodes else "unknown",
            checkpoint_id=checkpoint_id,
            created_at=snapshot.get("created_at"),
            input_data=None,
            output_data=snapshot.get("values"),
            metadata=snapshot.get("metadata")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to get execution detail for {thread_id}/{checkpoint_id}")
        raise HTTPException(status_code=500, detail=str(e)) from e
