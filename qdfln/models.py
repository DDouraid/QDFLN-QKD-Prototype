import torch.nn as nn


def create_global_model(input_dim: int) -> nn.Module:
    return nn.Linear(input_dim, 1)

