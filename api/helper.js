module.exports = {
  response: function(res, json={}, status=200) {
    if(json === null)
      res.sendStatus(status);
    else
      res.status(status).json(json)
  }  
}