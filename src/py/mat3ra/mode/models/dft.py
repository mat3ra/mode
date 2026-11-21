from typing import Any, Dict, List, Union

from mat3ra.esse.models.core.primitive.slugified_entry import SlugifiedEntry
from mat3ra.esse.models.models_directory.legacy.dft_gga import Functional as GGAFunctional
from pydantic import Field

from ..model import Model


class DFTModel(Model):
    type: str = Field(default="dft")
    subtype: str = Field(default="gga")
    functional: Union[str, GGAFunctional, SlugifiedEntry, Dict[str, Any], None] = Field(
        default=GGAFunctional.pbe
    )
    refiners: List[Union[SlugifiedEntry, str]] = Field(default_factory=list)
    modifiers: List[Union[SlugifiedEntry, str]] = Field(default_factory=list)

