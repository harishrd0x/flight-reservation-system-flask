from marshmallow import Schema, fields, validate

class AirplaneCreateSchema(Schema):
    airplane_number = fields.Str(required=True, validate=validate.Length(equal=6))
    model = fields.Str(required=True)
    total_seats = fields.Int(required=True)
    economy_seats = fields.Int(required=True)
    business_seats = fields.Int(required=True)
    first_class_seats = fields.Int(required=True)

class AirplaneResponseSchema(Schema):
    id = fields.Int()
    airplane_number = fields.Str()
    model = fields.Str()
    total_seats = fields.Int()
    economy_seats = fields.Int()
    business_seats = fields.Int()
    first_class_seats = fields.Int()
