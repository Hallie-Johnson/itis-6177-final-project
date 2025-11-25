# Azure AI Image Analysis API Documentation
Hallie Johnson - ITIS 6177

## Table of Contents
- [Overview](#overview)
- [Business Summary](#business-summary)
- [Architecture Diagram](#architecture-diagram)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [/Analyze Endpoint - Caption Generation](#analyze-endpoint---caption-generation)
- [/Analyze-Images Endpoint - Bounding Box Generation](#analyze-images-endpoint---bounding-box-generation)
- [API Endpoints](#api-endpoints)
- [Results Breakdown](#results-breakdown)
- [Technical Explanation of Bounding Boxes](#technical-explanation-of-bounding-boxes)
- [Common Errors](#common-errors)
- [Links](#links)

## Overview
The Image Analysis API allows users to send images to Azure AI Image Analysis and receive:
- Captions describing the image
- Sub-captions for individual sections of the image
- Bounding boxes for objects, people, and sub-captions
- Tags identifying objects, scenery, and humans
- Confidence scores for predictions

The API provides two endpoints:
1. `/analyze` - returns JSON metadata and analysis results
2. `/analyze-image` - returns the original image with bounding boxes drawn and labeled

## Business Summary
This API provides automated image analysis for applications like:
- Content moderation
- Accessibility (alt-text)
- Object detection for security
- Data tagging for image datasets
- Visual insights for marketing and media analysis

## Architecture Diagram
Below is a diagram showing how the API works:

![alt text](images/diagram.png)

## Prerequisites

#### Install Postman
Postman is required to send images to this API.
- Download Postman: https://www.postman.com/
- Create a Postman account

#### Image File
You may upload any standard image file from your computer. Supported and unsupported file types are shown below:

| Acceptable Image Types | Unsupported Image Types |
| -------- | ------- |
| JPEG (.jpg, .jpeg) | SVG (.svg) |
| PNG (.png) | PDF (.pdf) |
| GIF (.gif) | Raw Camera Files (.cr2, .nef, .arw, etc.) |
|  | PSD (Photoshop) (.psd) |
|  | HEIC/HEIF (iPhone) (.heic, .heif) |
|  | BMP (.bmp) |
|  | ICO (.ico) |

| Max File Size | Recommended Dimensions | Image Count |
| -------- | ------- | ------- |
| 20 MB | 50x50 px - 16,000x16,000 | Only 1 image per request |

## Getting Started
Complete the following steps to use the API:

#### 1. Open Postman.
![alt text](images/step1.png)

#### 2. Click on *Collections* in the left-hand sidebar. Click *Create Collection*.
![alt text](images/step2.png)

#### 3. Click *Add a request*.
![alt text](images/step3.png)

#### 4. The request now has the fields we need to input our request information.
![alt text](images/step4.png)

## Analyze Endpoint - Caption Generation
Follow the tutorial GIF below or use the steps provided.

![alt text](images/tutorial.gif)

### Step-by-Step Instructions

#### 1. Change *GET* to *POST* using the dropdown. Type the URL: http://161.35.181.15:3000/analyze into the *Enter URL or paste text* field.
![alt text](images/step5.png)

#### 2. Select *Body* and select *form-data*.
![alt text](images/step6.png)

#### 3. Under the *Key* parameter, type *image* and select *File* in the type dropdown. 
![alt text](images/step7.png)

#### 4. Under the *Value* parameter, click on *Select Files*. Click on *New file from local machine* and select an image on your system. 
![alt text](images/step8.png)

#### 5. Verify the following has been inputted. Click *Send* to send the image to the API.
| Field | Value |
| -------- | ------- |
| Method | POST |
| URL | http://161.35.181.15:3000/analyze |
|  | Body 
|  | form-data |
| Key | image |
|  | File |
| Value | [Your image file] |
| Description | | 

![alt text](images/step9.png)

#### 6.  The response returns a *200 OK* and returns image information based on the image you uploaded.
![alt text](images/step10.png)

## /Analyze-Images Endpoint - Bounding Box Generation
Follow the tutorial GIF below or use the steps provided.

![alt text](images/tutorial2.gif)

### Step-by-Step Instructions

#### 1. Change *GET* to *POST* using the dropdown. Type the URL: http://161.35.181.15:3000/analyze-image into the *Enter URL or paste text* field.
![alt text](images/stepA.png)

#### 2. Select *Body* and select *form-data*.
![alt text](images/stepB.png)

#### 3. Under the *Key* parameter, type *image* and select *File* in the type dropdown. 
![alt text](images/step7.png)

#### 4. Under the *Value* parameter, click on *Select Files*. Click on *New file from local machine* and select an image on your system. 
![alt text](images/step8.png)

#### 5. Verify the following has been inputted. Click *Send* to send the image to the API.
| Field | Value |
| -------- | ------- |
| Method | POST |
| URL | http://161.35.181.15:3000/analyze-image |
|  | Body 
|  | form-data |
| Key | image |
|  | File |
| Value | [Your image file] |
| Description | | 

![alt text](images/stepC.png)

#### 6.  The response returns your a *200 OK* status and the image you uploaded with bounding boxes and labels.
![alt text](images/stepD.png)

## API Endpoints
### POST `/analyze`
**Description**: Returns JSON metadata about the image, including captions, tags, and detected objects.

**Request**:
- Method: POST
- URL: http://161.35.181.15:3000/analyze
- Body: `form-data`
- Key: `image`
- Type: `File`
- Value: Your image file

**Response**:
```
{
    "modelVersion": "2023-10-01",
    "captionResult": { "text": "A crown with sunglasses", "confidence": 0.84 },
    "denseCaptionsResult": {
        "values": [
            { 
                "text": "A crown", 
                "confidence": 0.84, 
                "boundingBox": { 
                    "x": 804, 
                    "y": 46, 
                    "w": 305, 
                    "h": 262 
                } 
            }
        ]
    },
    "metadata": { 
        "width": 1920, 
        "height": 363 
    },
    "tagsResult": { 
        "values": [ 
            { 
                "name": "silhouette", 
                "confidence": 0.78 
            } 
        ]
    },
    "objectsResult": { 
        "values": [] 
    },
    "peopleResult": { 
        "values": [] 
    }
}
```

### POST `/analyze-image`
**Description**: Returns the original image with bounding boxes drawn around objects, dense captions, and detected people.

**Request**:
- Method: POST
- URL: http://161.35.181.15:3000/analyze-image
- Body: `form-data`
- Key: `image`
- Type: `File`
- Value: Your image file

**Response**:
- Content-Type: `image/png`
- The image will have red rectangles and labels over detected regions.
- If no bounding boxes are detected, the original image is returned.

## Results Breakdown
| Feature | Description |
| -------- | ------- |
| Caption | Primary caption for the image |
| Dense Captions | Region-based sub-captions with bounding boxes |
| Objects | Detected objects with location |
| People | Bounding boxes around humans |
| Tags | Labels identifying objects, scenery, etc. |
| Metadata | Width and height of the image |
| Confidence | AI's confidence for each prediction |
| Smart Crops | Suggested crops for highlighting regions |


## Technical Explanation of Bounding Boxes
- Bounding boxes are objects with coordinates:
    - x, y - top-left corner
    - w, h - width and height
- Drawn as red rectangles with labels

## Common Errors

### No Image Uploaded
![alt text](images/error1.png)

**Cause**: Image file missing in request.

**Solution**: Upload image and/or verify form-data is correct.

### Bounding Box Drawing Failed - Input Buffer Contains Unsupported Image Format
![alt text](images/error2.png)

**Cause**: Image file is an unsupported file.

**Solution**: Upload image with acceptable file format.

### Error: read ECONNRESET - Could not get response
![alt text](images/error3.png)

**Cause**: Image file is too large or too small or connection issues.

**Solution**: Upload image with acceptable resolution and/or file size or check internet connection.

## Links
- [Azure AI Image Analysis](https://azure.microsoft.com/en-us/products/ai-services/ai-vision/)
- [Azure AI Vision Image Analysis Documentation](#https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-vision-image-analysis-rest-readme?view=azure-node-preview)
- [Postman](https://www.postman.com/)