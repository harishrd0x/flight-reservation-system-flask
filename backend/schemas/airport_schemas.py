# backend/schemas/airport_schema.py

from marshmallow import Schema, fields, validate

class AirportCreateSchema(Schema):
    name = fields.Str(required=True)
    city = fields.Str(required=True)
    country = fields.Str(required=True)
    airport_code = fields.Str(required=True, validate=validate.Length(equal=3))

class AirportResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    code = fields.Str()  # Airport code (e.g., 'JFK', 'LHR')
    city = fields.Str()  # Optionally, city or other details
    country = fields.Str()  # Optionally, country

