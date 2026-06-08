const express = require('express');
const routes = express.Router();
const db = require('../db');

routes.get('/estado', (req, res) => {
  const corrida = req.app.locals.corrida;
  res.json(corrida.getEstado());
});

routes.post('/iniciar', (req, res) => {
  const corrida = req.app.locals.corrida;

  db.query('SELECT * FROM corredores', (err, corredores) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar corredores' });
    if (corredores.length === 0) return res.status(400).json({ error: 'Nenhum corredor cadastrado' });

    corrida.iniciar(corredores);
    res.json({ message: 'Corrida iniciada', corredores: corredores.length });
  });
});

routes.post('/chegada/:corredorId', (req, res) => {
  const corrida = req.app.locals.corrida;
  const { corredorId } = req.params;

  const tempoFinal = corrida.registrarChegada(parseInt(corredorId));
  if (!tempoFinal) {
    return res.status(400).json({ error: 'Corredor não encontrado ou já finalizou' });
  }

  db.query(
    'INSERT INTO voltas (tempo, data, corredores_id) VALUES (?, NOW(), ?)',
    [tempoFinal, corredorId],
    (err) => {
      if (err) console.error('Erro ao salvar tempo no banco:', err);
    }
  );

  res.json({ message: 'Chegada registrada', corredorId, tempoFinal });
});

routes.post('/encerrar', (req, res) => {
  const corrida = req.app.locals.corrida;
  corrida.encerrar();
  res.json({ message: 'Corrida encerrada' });
});

module.exports = routes;