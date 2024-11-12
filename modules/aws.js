const AWS = require("aws-sdk");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

// Function to map key-value blocks from Textract response
function getKVMap(response) {
    const blocks = response.Blocks;
    const keyMap = {};
    const valueMap = {};
    const blockMap = {};

    blocks.forEach(block => {
        blockMap[block.Id] = block;
        if (block.BlockType === 'KEY_VALUE_SET') {
            if (block.EntityTypes && block.EntityTypes.includes('KEY')) {
                keyMap[block.Id] = block;
            } else {
                valueMap[block.Id] = block;
            }
        }
    });

    return { keyMap, valueMap, blockMap };
}

// Function to get the relationship between key-value pairs
function getKVRelationship(keyMap, valueMap, blockMap) {
    const kvs = {};
    Object.keys(keyMap).forEach(blockId => {
        const keyBlock = keyMap[blockId];
        const valueBlock = findValueBlock(keyBlock, valueMap);
        const key = getText(keyBlock, blockMap);
        const val = getText(valueBlock, blockMap);
        kvs[key] = val;
    });
    return kvs;
}

// Find the corresponding value block for a given key block
function findValueBlock(keyBlock, valueMap) {
    if (keyBlock.Relationships) {
        for (const relationship of keyBlock.Relationships) {
            if (relationship.Type === 'VALUE') {
                for (const valueId of relationship.Ids) {
                    return valueMap[valueId];
                }
            }
        }
    }
    return null;
}

// Extract text from the block map
function getText(result, blocksMap) {
    let text = '';
    if (result && result.Relationships) {
        result.Relationships.forEach(relationship => {
            if (relationship.Type === 'CHILD') {
                relationship.Ids.forEach(childId => {
                    const word = blocksMap[childId];
                    if (word.BlockType === 'WORD') {
                        text += `${word.Text} `;
                    } else if (word.BlockType === 'SELECTION_ELEMENT' && word.SelectionStatus === 'SELECTED') {
                        text += 'X ';
                    }
                });
            }
        });
    }
    return text.trim();
}

// Main function to process the response
async function main(data) {
    try {
        const response = data;
        const { keyMap, valueMap, blockMap } = getKVMap(response);
        const kvs = getKVRelationship(keyMap, valueMap, blockMap);
        console.log(kvs);
        return kvs;
    } catch (error) {
        console.error('Error processing document:', error);
    }
}

// Configure AWS Textract
const textract = new AWS.Textract({
    region: process.env.REGION, // e.g., "us-east-1"
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// Function to call Textract for extracting key-value pairs from an uploaded file
async function analyzeDocument(file) {
    const fileData = file.buffer; // The buffer of the uploaded file (e.g., from a form submission)

    const params = {
        Document: {
            Bytes: fileData,
        },
        FeatureTypes: ["FORMS"], // "FORMS" enables key-value pair extraction
    };

    try {
        const response = await textract.analyzeDocument(params).promise();
        return await main(response);
    } catch (error) {
        console.error("Error extracting document:", error);
    }
}

// Example usage: Upload a file using an HTTP form and pass it to `analyzeDocument`
module.exports = { analyzeDocument };
