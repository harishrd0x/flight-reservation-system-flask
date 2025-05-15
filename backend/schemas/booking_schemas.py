from marshmallow import Schema, fields, validate
from marshmallow_enum import EnumField
from models.enums import BookingStatusEnum, PassengerStatusEnum

class PassengerSchema(Schema):
    id = fields.Int(dump_only=True)
    booking_id = fields.Int(required=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1))
    last_name = fields.Str(required=True, validate=validate.Length(min=1))
    gender = fields.Str(required=True, validate=validate.OneOf(["M", "F", "O"]))
    age = fields.Int(required=True, validate=validate.Range(min=0))
    status = EnumField(PassengerStatusEnum, by_value=True, dump_default=PassengerStatusEnum.BOOKED)
    cancellation_time = fields.DateTime(allow_none=True, dump_only=True)

class BookingSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    flight_id = fields.Int(required=True)
    booking_time = fields.DateTime(dump_only=True)
    status = EnumField(BookingStatusEnum, by_value=True, dump_default=BookingStatusEnum.PENDING)
    total_price = fields.Decimal(as_string=True, required=True)
    passengers = fields.List(fields.Nested(PassengerSchema), required=True)
