const express = require('express')
const PORT = 3000

const app = express()

app.get('/',(req,res)=>{
    res.send('<h1>Hello, this is your Node Backend</h1>')
})

app.listen(PORT,()=>{
    console.log(`Server hosted at http://localhost:${PORT}`)
})