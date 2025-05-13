# backend/schemas/flight_schema.py

from marshmallow import Schema, fields, validate
from backend.models.enums import FlightStatus

class FlightCreateSchema(Schema):
    flight_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    airplane_id = fields.Int(required=True)
    source_airport_id = fields.Int(required=True)
    destination_airport_id = fields.Int(required=True)
    departure_time = fields.DateTime(required=True, format='%Y-%m-%d %H:%M:%S')
    arrival_time = fields.DateTime(required=True, format='%Y-%m-%d %H:%M:%S')
    status = fields.Str(required=True, validate=validate.OneOf([status.name for status in FlightStatus]))

class FlightUpdateSchema(Schema):
    flight_name = fields.Str(validate=validate.Length(min=1, max=100))
    airplane_id = fields.Int()
    source_airport_id = fields.Int()
    destination_airport_id = fields.Int()
    departure_time = fields.DateTime(format='%Y-%m-%d %H:%M:%S')
    arrival_time = fields.DateTime(format='%Y-%m-%d %H:%M:%S')
    status = fields.Str(validate=validate.OneOf([status.name for status in FlightStatus]))

class FlightResponseSchema(Schema):
    id = fields.Int()
    flight_name = fields.Str()
    airplane_id = fields.Int()
    source_airport_id = fields.Int()
    destination_airport_id = fields.Int()
    departure_time = fields.DateTime(format='%Y-%m-%d %H:%M:%S')
    arrival_time = fields.DateTime(format='%Y-%m-%d %H:%M:%S')
    status = fields.Str()
