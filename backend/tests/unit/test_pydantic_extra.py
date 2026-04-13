from pydantic import BaseModel, ConfigDict
import sys

class DTO(BaseModel):
    model_config = ConfigDict(extra='allow')
    title: str

class TSK(BaseModel):
    model_config = ConfigDict(extra='allow')
    title: str

dto = DTO(**{"title": "abc", "Ext": "123"})
data = dto.model_dump()
tsk = TSK(**data)
print("DUMP:", tsk.model_dump())
