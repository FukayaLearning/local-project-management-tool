import os
import pandas as pd
from typing import List, Optional, Dict
from backend.app.domain.entities.task import Task
from backend.app.domain.repositories.task_repository import ITaskRepository


class TaskFileRepository(ITaskRepository):
    def _task_file_path(self, project_dir: str) -> str:
        return os.path.join(project_dir, "tasks.csv")

    def _read_df(self, project_dir: str) -> pd.DataFrame:
        task_file = self._task_file_path(project_dir)
        if not os.path.exists(task_file):
            return pd.DataFrame(columns=Task.model_fields.keys())
        try:
            df = pd.read_csv(task_file, dtype=str).fillna("")
            return df
        except pd.errors.EmptyDataError:
            return pd.DataFrame(columns=Task.model_fields.keys())

    def _save_df(self, project_dir: str, df: pd.DataFrame):
        task_file = self._task_file_path(project_dir)
        df.to_csv(task_file, index=False)

    def _row_to_task(self, row: pd.Series) -> Task:
        data = row.to_dict()
        for k, v in data.items():
            if v == "":
                data[k] = None

        if data.get("planned_hours") is not None:
            data["planned_hours"] = float(data["planned_hours"])
        if data.get("actual_hours") is not None:
            data["actual_hours"] = float(data["actual_hours"])
        if data.get("progress") is not None:
            data["progress"] = int(float(data["progress"]))
        if data.get("display_order") is not None:
            data["display_order"] = int(float(data["display_order"]))

        for f in ["progress", "display_order"]:
            if f in data and data[f] is None:
                del data[f]

        return Task(**data)

    def get_all(self, project_dir: str) -> List[Task]:
        df = self._read_df(project_dir)
        if df.empty:
            return []
        return [self._row_to_task(row) for _, row in df.iterrows()]

    def get_by_id(self, project_dir: str, task_id: str) -> Optional[Task]:
        df = self._read_df(project_dir)
        if df.empty:
            return None
        row = df[df["id"] == task_id]
        if row.empty:
            return None
        return self._row_to_task(row.iloc[0])

    def save(self, project_dir: str, task: Task) -> Task:
        df = self._read_df(project_dir)
        new_row = task.model_dump(mode='json')
        new_df_row = pd.DataFrame([new_row])
        if df.empty:
            df = new_df_row
        else:
            df = pd.concat([df, new_df_row], ignore_index=True)
        self._save_df(project_dir, df)
        return task

    def update(self, project_dir: str, task: Task) -> Task:
        df = self._read_df(project_dir)
        if df.empty:
            return self.save(project_dir, task)

        df = df[df["id"] != task.id]
        new_row = task.model_dump(mode='json')
        new_df_row = pd.DataFrame([new_row])
        df = pd.concat([df, new_df_row], ignore_index=True)
        self._save_df(project_dir, df)
        return task

    def delete(self, project_dir: str, task_id: str) -> bool:
        df = self._read_df(project_dir)
        if df.empty:
            return False

        initial_len = len(df)
        df = df[df["id"] != task_id]
        if len(df) < initial_len:
            self._save_df(project_dir, df)
            return True
        return False

    def update_orders(self, project_dir: str, task_orders: List[Dict]) -> bool:
        df = self._read_df(project_dir)
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
            self._save_df(project_dir, df)
            return True
        return False

    def initialize_empty_csv(self, project_dir: str) -> None:
        task_file = self._task_file_path(project_dir)
        os.makedirs(project_dir, exist_ok=True)
        df = pd.DataFrame(columns=Task.model_fields.keys())
        df.to_csv(task_file, index=False)
