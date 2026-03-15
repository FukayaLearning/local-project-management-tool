import os
import pandas as pd
from typing import List, Optional, Dict
from datetime import datetime, date
from backend.app.domain.entities.task import Task
from backend.app.domain.repositories.task_repository import ITaskRepository

class TaskFileRepository(ITaskRepository):
    def __init__(self, data_dir: str = "data"):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.data_dir = os.path.join(base_dir, data_dir)
        self.task_file = os.path.join(self.data_dir, "tasks.csv")
        os.makedirs(self.data_dir, exist_ok=True)

    def _read_df(self) -> pd.DataFrame:
        if not os.path.exists(self.task_file):
            return pd.DataFrame(columns=Task.model_fields.keys())
        try:
             # Read all as string first to avoid NaN/float issues for optional fields, then process
            df = pd.read_csv(self.task_file, dtype=str).fillna("")
            return df
        except pd.errors.EmptyDataError:
            return pd.DataFrame(columns=Task.model_fields.keys())

    def _save_df(self, df: pd.DataFrame):
        df.to_csv(self.task_file, index=False)

    def _row_to_task(self, row: pd.Series) -> Task:
        data = row.to_dict()
        # Clean up empty strings to None for Optional fields
        for k, v in data.items():
            if v == "":
                data[k] = None
        
        # Convert date strings back to date objects if needed, but Pydantic handles str -> date
        # Convert numeric fields
        if data.get("planned_hours") is not None:
            data["planned_hours"] = float(data["planned_hours"])
        if data.get("actual_hours") is not None:
            data["actual_hours"] = float(data["actual_hours"])
        if data.get("progress") is not None:
            data["progress"] = int(float(data["progress"])) # handle potential float string "0.0"
        if data.get("display_order") is not None:
            data["display_order"] = int(float(data["display_order"]))
            
        # Remove None values for non-optional fields so Pydantic uses default
        for f in ["progress", "display_order"]:
            if f in data and data[f] is None:
                del data[f]

        return Task(**data)

    def get_all(self) -> List[Task]:
        df = self._read_df()
        if df.empty:
            return []
        return [self._row_to_task(row) for _, row in df.iterrows()]

    def get_by_id(self, task_id: str) -> Optional[Task]:
        df = self._read_df()
        if df.empty:
            return None
        row = df[df["id"] == task_id]
        if row.empty:
            return None
        return self._row_to_task(row.iloc[0])

    def save(self, task: Task) -> Task:
        df = self._read_df()
        new_row = task.model_dump(mode='json') # handles date serialization
        # Ensure new_row only has keys that align with columns (or handles new columns)
        
        # Remove None values so they become NaN or empty string in DF logic? 
        # Actually easier to just append.
        
        new_df_row = pd.DataFrame([new_row])
        # Align columns
        if df.empty:
             df = new_df_row
        else:
             df = pd.concat([df, new_df_row], ignore_index=True)
        
        self._save_df(df)
        return task

    def update(self, task: Task) -> Task:
        df = self._read_df()
        if df.empty:
            return self.save(task) # Should potentially error if ID not found, but safe fallback
        
        # remove old row
        df = df[df["id"] != task.id]
        
        # append new row
        new_row = task.model_dump(mode='json')
        new_df_row = pd.DataFrame([new_row])
        df = pd.concat([df, new_df_row], ignore_index=True)
        
        self._save_df(df)
        return task

    def delete(self, task_id: str) -> bool:
        df = self._read_df()
        if df.empty:
            return False
        
        initial_len = len(df)
        df = df[df["id"] != task_id]
        if len(df) < initial_len:
            self._save_df(df)
            return True
        return False

    def update_orders(self, task_orders: List[Dict]) -> bool:
        df = self._read_df()
        if df.empty:
            return False
            
        if "display_order" not in df.columns:
            df["display_order"] = "0"
            
        updated_any = False
        for order in task_orders:
            task_id = order.get("id")
            display_order = order.get("display_order")
            if task_id in df["id"].values:
                df.loc[df["id"] == task_id, "display_order"] = str(display_order)
                updated_any = True
                
        if updated_any:
            self._save_df(df)
            return True
        return False
