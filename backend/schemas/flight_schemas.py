from marshmallow import Schema, fields, validate
from models.enums import FlightStatus  # Imported from centralized enums

class FlightCreateSchema(Schema):
    flight_number = fields.Str(required=True)
    airplane_id = fields.Int(required=True)
    departure_airport_id = fields.Int(required=True)
    arrival_airport_id = fields.Int(required=True)
    departure_time = fields.DateTime(required=True)
    arrival_time = fields.DateTime(required=True)
    status = fields.Str(
        required=True,
        validate=validate.OneOf([status.value for status in FlightStatus]),
    )
    price = fields.Float(required=True)  # Single price for all classes

class FlightUpdateSchema(FlightCreateSchema):
    pass

class FlightResponseSchema(Schema):
    id = fields.Int()
    flight_number = fields.Str()
    airplane_id = fields.Int()
    departure_airport_id = fields.Int()
    arrival_airport_id = fields.Int()
    departure_time = fields.DateTime()
    arrival_time = fields.DateTime()
    status = fields.Str(validate=validate.OneOf([status.value for status in FlightStatus]))
    price = fields.Float()
