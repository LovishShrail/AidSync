#!/usr/bin/env python3
import os
import sys
import rerun as rr
import numpy as np

# Try to use Open3D for PLY loading, fall back to simpler methods if unavailable
try:
    import open3d as o3d
    HAS_OPEN3D = True
except ImportError:
    HAS_OPEN3D = False
    print("Open3D not found. Using simplified PLY parser.")
    try:
        from plyfile import PlyData
        HAS_PLYFILE = True
    except ImportError:
        HAS_PLYFILE = False
        print("Neither Open3D nor plyfile found. Install with:")
        print("pip install open3d")
        print("or")
        print("pip install plyfile")
        sys.exit(1)

# Get the project root directory
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Define input and output paths
input_path = os.path.join(project_root, "public", "models", "model.ply")
output_path = os.path.join(project_root, "public", "models", "model.rrd")

print(f"Converting PLY file: {input_path}")
print(f"Output RRD file: {output_path}")

# First, verify the PLY file exists
if not os.path.exists(input_path):
    print(f"ERROR: PLY file does not exist at {input_path}")
    print("Please ensure your model file exists at this location.")
    sys.exit(1)

# Initialize Rerun
rr.init("PLY to RRD converter", spawn=False)

if HAS_OPEN3D:
    # Load PLY with Open3D
    try:
        print("Loading PLY file with Open3D...")
        pcd = o3d.io.read_point_cloud(input_path)
        
        # Extract points and colors
        points = np.asarray(pcd.points)
        
        if pcd.has_colors():
            colors = np.asarray(pcd.colors) * 255  # Convert to 0-255 range
            print(f"Loaded {len(points)} points with colors")
            rr.log("model", rr.Points3D(points, colors=colors))
        else:
            print(f"Loaded {len(points)} points without colors")
            rr.log("model", rr.Points3D(points))
    except Exception as e:
        print(f"Error loading with Open3D: {e}")
        HAS_OPEN3D = False  # Fall back to plyfile

if not HAS_OPEN3D and HAS_PLYFILE:
    # Load PLY with plyfile
    try:
        print("Loading PLY file with plyfile...")
        plydata = PlyData.read(input_path)
        vertex = plydata['vertex']
        
        # Extract coordinates
        x = np.array(vertex['x'])
        y = np.array(vertex['y'])
        z = np.array(vertex['z'])
        points = np.column_stack((x, y, z))
        
        # Check if colors exist
        if all(c in vertex for c in ['red', 'green', 'blue']):
            r = np.array(vertex['red'])
            g = np.array(vertex['green'])
            b = np.array(vertex['blue'])
            colors = np.column_stack((r, g, b))
            print(f"Loaded {len(points)} points with colors")
            rr.log("model", rr.Points3D(points, colors=colors))
        else:
            print(f"Loaded {len(points)} points without colors")
            rr.log("model", rr.Points3D(points))
    except Exception as e:
        print(f"Error loading with plyfile: {e}")
        sys.exit(1)

# Set a default camera position - using the correct API
# The API has changed - removing the timeless parameter and using the correct camera function
rr.log("model/camera", rr.ViewCoordinates.RIGHT_HAND_Y_UP)
# Use the new Camera API (depends on your Rerun version)
try:
    # For newer Rerun versions
    rr.log("model/camera", rr.Camera3D(look_at=[0, 0, 0], distance=5))
except AttributeError:
    # For older Rerun versions
    try:
        from rerun.components import Camera3D
        rr.log("model/camera", Camera3D(look_at=[0, 0, 0], distance=5))
    except (ImportError, AttributeError):
        print("Warning: Could not set camera position - please check Rerun documentation for your version")

# Save the recording
print(f"Saving RRD file to {output_path}...")
rr.save(output_path)
print("Conversion complete!")