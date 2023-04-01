const validation = (schema: any, property: any) => { 
    return (req: any, res: any, next: any) => {
        const { error } = schema.validate(req.body);
        let validationResult  = schema.validate(req.body); 
        const valid = error == null; 

        if (valid) { 
            req.body = property ? validationResult.value[property] : validationResult.value;
            next(); 
        } else { 
            const { details } = error; 
            const message = details.map(i => i.message).join(',');
            res.status(422).json({ error: message })
        } 
    } 
}

export default validation;