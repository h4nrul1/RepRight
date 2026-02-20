import numpy as np


def calculate_angle(a: tuple, b: tuple, c: tuple) -> float:
    """Calculate angle at point b formed by points a-b-c.

    Args:
        a: (x, y) coordinates of first point
        b: (x, y) coordinates of vertex point
        c: (x, y) coordinates of third point

    Returns:
        Angle in degrees (0-180)
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    cosine = np.clip(cosine, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine))

    return float(angle)


def angle_to_vertical(a: tuple, b: tuple) -> float:
    """Calculate angle between line a->b and vertical axis.

    Args:
        a: (x, y) top point
        b: (x, y) bottom point

    Returns:
        Angle in degrees from vertical (0 = perfectly upright)
    """
    dx = b[0] - a[0]
    dy = b[1] - a[1]

    # Vertical is (0, 1) in image coordinates (y increases downward)
    angle = np.degrees(np.arctan2(abs(dx), abs(dy)))
    return float(angle)
