#!/usr/bin/env node
const express = require('express')
const config = require('./config/db.js')
const mysql = require('mysql')
const fs = require('fs')
// create an express(aka web server), and start the server
const app = express()
const port = 8217
app.listen(port, () => {
  console.log(`listening on port: ${port}`)
})

app.use(express.static(`${__dirname}/dist`))
app.set('view engine', 'hbs')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//connect to mysql

const connection = mysql.createConnection(config.mysql)

connection.connect(err => {
  if (err) {
    console.log('fail to connect:', err)
    process.exit()
  }

})

//route
app.get('/employee', (req, res) => {
  connection.query(`SELECT EID, Employee.Name AS EName, Phone, Email, DATE_FORMAT(Bdate, "%Y-%m-%d") AS Bdate, Salary, Department.Name AS DName FROM Employee, Department WHERE Employee.DNUM=Department.DNUM`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    res.render('employee', {data: result, notQueryExist: true})
  })  
})

app.get('/client', (req, res) => {
  connection.query(`SELECT * FROM Client`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    res.render('client', {data: result})
  })  
})

app.get('/supplier', (req, res) => {
  connection.query(`SELECT * FROM Supplier`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    res.render('supplier', {data: result})
  })  
})


app.get('/order', (req, res) => {
  let data = {}
  connection.query(`SELECT EID, Name FROM Employee WHERE DNUM=1`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    data.Receive = result
  })
  connection.query(`SELECT EID, Name FROM Employee WHERE DNUM=3`, (err, result) =>{
    if (err) console.log('fail to select:', err)
    data.Confirm = result
  })       
  connection.query(`SELECT Orders.OID, CurrentStatus, DATE_FORMAT(OrderDate, "%Y-%m-%d") AS OrderDate, Client.Name AS PlaceClient, Client.Address, Client.Phone, SUM(SalePrice*Amount) AS Total, Orders.ReceiveEID, Orders.ConfirmEID FROM Orders, Client, Have, Product WHERE Orders.PlaceCID=Client.CID AND Orders.OID=Have.OID AND Have.PID=Product.PID GROUP BY Orders.OID`, (err, result) => {
    if (err) console.log('fail to select:', err)
    data.Order = result
    res.render('order', {data: data})    
  })
})


//action
app.get('/delete-Employee', (req, res) => {
  console.log(req.query.EID)
  connection.query(`DELETE FROM Employee WHERE EID=${req.query.EID}`, (err, result) =>{
    if (err) console.log('fail to delete:', err)  
    res.send()
  })
})

app.post('/submit-Employee-Form', (req, res) => {
  if(req.body.query_cond == 'insert'){
    connection.query(`INSERT INTO Employee(Name, Phone, Email, Bdate, Salary, DNUM) VALUES ('${req.body.name}', '${req.body.phone}', '${req.body.email}', '${req.body.birthday}', ${req.body.salary}, ${req.body.department})`, (err, result) =>{
      if (err) console.log('insert:', err)
      res.redirect('employee')
    })      
  }else{
    connection.query(`UPDATE Employee SET Name='${req.body.name}', Phone='${req.body.phone}', Email='${req.body.email}', Bdate='${req.body.birthday}', Salary=${req.body.salary}, DNUM=${req.body.department} WHERE EID=${req.body.query_cond}`, (err, result) =>{
      if (err) console.log('update:', err)
      res.redirect('employee')
    })          
  }
})

app.get('/search-employee-Detail', (req, res) => {
  let data = {}
  if(req.query.search_cond == 'COUNT'){
    connection.query(`SELECT COUNT(Name) AS cnt FROM Employee`, (err, result) =>{
      if (err) console.log('select:', err)
      data.optionID = 1
      data.res = `員工人數:${result[0].cnt}人`
      res.send(data)
    })     
  }

  if(req.query.search_cond == 'AVG'){
    connection.query(`SELECT AVG(Salary) AS AVG FROM Employee`, (err, result) =>{
      if (err) console.log('select:', err)
      data.optionID = 2
      data.res = `平均薪資:${result[0].AVG}元`
      res.send(data)
    })     
  }

  if(req.query.search_cond == 'MAX'){
    connection.query(`SELECT MAX(Salary) AS MAX FROM Employee`, (err, result) =>{
      if (err) console.log('select:', err)
      data.optionID = 3
      data.res = `最高薪資:${result[0].MAX}元`
      res.send(data)
    })     
  }

  if(req.query.search_cond == 'MIN'){
    connection.query(`SELECT MIN(Salary) AS MIN FROM Employee`, (err, result) =>{
      if (err) console.log('select:', err)
      data.optionID = 4
      data.res = `最低薪資:${result[0].MIN}人`
      res.send(data)
    })     
  }  
})

app.get('/search-avg-Salary', (req, res)=>{
  connection.query(`SELECT Department.Name FROM Employee, Department WHERE Employee.DNUM=Department.DNUM GROUP BY Employee.DNUM HAVING AVG(Salary)>50000`, (err, result) =>{
    if (err) console.log('select:', err)
    let str = ''
    result.forEach(element => {
      str += `${element.Name}  `
    })
    res.send(str)
  })  
})

app.get('/get-order-Detail', (req, res) => {
  connection.query(`SELECT * FROM Product, Have WHERE Product.PID=Have.PID AND OID=${req.query.OID}`, (err, result) =>{
    if (err) console.log('select:', err)
    //console.log(result)
    res.send(result)
  })     
})

app.get('/delete-Order', (req, res) => {
  console.log(req.query.OID)
  connection.query(`DELETE FROM Orders WHERE OID=${req.query.OID}`, (err, result) =>{
    if (err) console.log('fail to delete:', err)  
    res.send()
  })
})


app.post('/get-supplier-inTainan', (req, res) => {
  connection.query(`SELECT * FROM supplier WHERE SID IN (SELECT SID FROM supplier WHERE Address LIKE '%台南%')`, (err, result) =>{
    if (err) console.log('select:', err)
    res.render('supplier', {data: result})
  })       
})

app.post('/get-supplier-notInTainan', (req, res) => {
  connection.query(`SELECT * FROM supplier WHERE SID NOT IN (SELECT SID FROM supplier WHERE Address LIKE '%台南%')`, (err, result) =>{
    if (err) console.log('select:', err)
    res.render('supplier', {data: result})
  })       
})

app.post('/get-employee-orderUnfinish', (req, res) => {
  connection.query(`SELECT Name AS EName, Phone, Email, DATE_FORMAT(Bdate, "%Y-%m-%d") AS Bdate, Salary FROM Employee WHERE EXISTS (SELECT * FROM Orders WHERE Orders.ReceiveEID=Employee.EID AND orders.CurrentStatus='未出貨')`, (err, result) =>{
    if (err) console.log('select:', err)
    result.forEach(element => {
      element.DName = '業務部'
    })
    res.render('employee', {data: result})
  })       
})

app.post('/get-employee-orderfinish', (req, res) => {
  connection.query(`SELECT Name AS EName, Phone, Email, DATE_FORMAT(Bdate, "%Y-%m-%d") AS Bdate, Salary FROM Employee WHERE NOT EXISTS (SELECT * FROM Orders WHERE Orders.ReceiveEID=Employee.EID AND orders.CurrentStatus='未出貨') AND Employee.DNUM=1`, (err, result) =>{
    if (err) console.log('select:', err)
    result.forEach(element => {
      element.DName = '業務部'
    })
    res.render('employee', {data: result})
  })       
})