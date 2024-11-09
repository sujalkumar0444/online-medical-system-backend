const AWS = require("aws-sdk");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();


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

async function main(data) {

    try {
        const response = data;
        const { keyMap, valueMap, blockMap } = getKVMap(response);

        const kvs = getKVRelationship(keyMap, valueMap, blockMap);
        console.log(kvs);
        // console.log(kvs['Registration No:']);

    } catch (error) {
        console.error('Error reading file:', error);
    }

}

// Configure AWS Textract
const textract = new AWS.Textract({
    region: process.env.REGION, // e.g., "us-east-1"
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// Function to call Textract for extracting key-value pairs
async function analyzeDocument(filePath) {
    const fileData = fs.readFileSync(filePath);

    const params = {
        Document: {
            Bytes: fileData,
        },
        FeatureTypes: ["FORMS"], // "FORMS" enables key-value pair extraction
    };

    try {
        const response = await textract.analyzeDocument(params).promise();
        main(response);
        

    } catch (error) {
        console.error("Error extracting document:", error);
    }
}

// Example usage
analyzeDocument("cert.pdf");
