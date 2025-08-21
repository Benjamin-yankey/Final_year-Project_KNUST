# Testing Instructions

Download and place weights file from this [link](https://mega.nz/file/aQ8nQAJB#ySPZoRg2-2SZhH2Cn9P4VZkh56fUF8mzLOaCWjHLlNY) as `crop_weed_detection.weights` in this `testing` folder.

## New: Single-image inference script

A new script `infer_image.py` runs YOLO inference on a single image and prints JSON with detections and a base64-encoded annotated image.

Usage:

```bash
python3 infer_image.py --image /absolute/path/to/image.jpg
```

Optional flags:

- `--config` (default: `crop_weed.cfg`)
- `--weights` (default: `crop_weed_detection.weights`)
- `--names` (default: `obj.names`)
- `--conf` (default: `0.5`)
- `--nms` (default: `0.5`)

Python dependencies are listed in `../requirements.txt`. Install with:

```bash
pip install -r ../requirements.txt
```
