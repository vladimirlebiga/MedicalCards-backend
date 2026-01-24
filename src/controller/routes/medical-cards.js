const { AppDataSource } = require('../../repository/data-source');
const { checkToken } = require('../../middleware/auth-middleware');
const { validate } = require('../../middleware/auth-validate-middleware');
const { medicalCardsSchema } = require('../../schema/medicalCards-schema');
const { LessThan, MoreThan, Like, Equal, Or } = require('typeorm');
const { errors } = require('../../constants/error');


const express = require('express');
const router = express.Router();


const medicalCardsRepo = () => AppDataSource.getRepository('MedicalCards');
router.get('/search', checkToken, async (req, res, next) => {
  try {
    const { search, pastVisit, priority } = req.query;
    const userId = req.user.id;
    
    // Build base query with query builder for OR conditions
    const queryBuilder = medicalCardsRepo().createQueryBuilder('card');
    
    // Always filter by user
    queryBuilder.where('card.userId = :userId', { userId });
    
    // Date filter
    if (pastVisit === 'true') {
      queryBuilder.andWhere('card.dateVisit < :now', { now: new Date() });
    } else if (pastVisit === 'false') {
      queryBuilder.andWhere('card.dateVisit > :now', { now: new Date() });
    }
    
    // Priority filter
    if (priority) {
      queryBuilder.andWhere('card.priority = :priority', { priority });
    }
    
    // Search across all fields with OR conditions
    if (search) {
      const searchConditions = [];
      const searchParams = {};
      
      // String fields - use LIKE
      const stringFields = ['firstName', 'lastName', 'target', 'description', 'doctor', 'pressure', 'diagnosis'];
      stringFields.forEach((field, index) => {
        const paramName = `search${index}`;
        searchConditions.push(`card.${field} LIKE :${paramName}`);
        searchParams[paramName] = `%${search}%`;
      });
      
      // Integer fields - try to parse as number and use exact match
      const searchNum = parseFloat(search);
      if (!isNaN(searchNum) && isFinite(searchNum)) {
        // If search is a valid number, also search in integer fields
        searchConditions.push('card.age = :ageSearch');
        searchConditions.push('card.index = :indexSearch');
        searchParams.ageSearch = searchNum;
        searchParams.indexSearch = searchNum;
      }
      
      // Combine all search conditions with OR
      if (searchConditions.length > 0) {
        queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, searchParams);
      }
    }
    
    const medicalCards = await queryBuilder.getMany();
    res.json(medicalCards);
  } catch(err) {
    console.error('Medical cards route error:', err);
    next(err);
  }
})

router.get('/', checkToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const medicalCards = await medicalCardsRepo().find({ where: { userId: id } });
    res.json(medicalCards);
  } catch (err) {
    console.error('Medical cards route error:', err);
    next(err);
  }
});

router.get('/:id', checkToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const medicalCard = await medicalCardsRepo().findOne({ where: { id: req.params.id, userId: id } });
    if(!medicalCard) {
      return res.status(404).json({ message: errors.NOT_FOUND });
    }
    res.json(medicalCard);
  } catch (err) {
    console.error('Medical cards route error:', err);
    next(err);
  }
});

router.post('/', checkToken, validate(medicalCardsSchema),  async (req, res, next) => {
  try {
    const id = req.user.id;
    const medicalCard = medicalCardsRepo().create({...req.body, userId:id});
    const result = await medicalCardsRepo().save(medicalCard);
    res.json(result);
  } catch (err) {
    console.error('Medical cards route error:', err);
    next(err);
  }
});

router.put('/:id', checkToken, validate(medicalCardsSchema), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const medicalCard = await medicalCardsRepo().findOne({ where: { id } });
  
 

    if (!medicalCard) {
      return res.status(404).json({ message: errors.NOT_FOUND });
    }
    if (medicalCard.userId !== userId) {
      return res.status(403).json({ message: errors.FORBIDDEN });
     }
    const updatedMedicalCard = await medicalCardsRepo().update(req.params.id, { ...req.body });
    res.json(updatedMedicalCard);
  } catch (err) {
    console.error('Medical cards route error:', err);
    next(err);
  }
});

router.delete('/:id', checkToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const medicalCard = await medicalCardsRepo().findOne({ where: { id: req.params.id, userId: id } });
    if(!medicalCard) {
      return res.status(404).json({ message: errors.NOT_FOUND });
    }
    await medicalCardsRepo().delete(medicalCard.id);

    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Medical cards route error:', err);
    next(err);
  }
});

module.exports = router;