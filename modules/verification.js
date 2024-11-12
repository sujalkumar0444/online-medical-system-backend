const axios = require('axios');

async function verifyCertificate(state, extractedData) {

    if(state==='telangana') {
        const registrationNo = extractedData['Registration No:'];
        const response = await axios({
            method: 'GET',
            url: `https://api.regonlinetsmc.in/tsmc/api/v1/common/getDoctorInfoByNameGender?fmrNo=${registrationNo}&docName=&gender=&fatherName=`,
        });

        const data = response.data;
        
        
    }
    
}