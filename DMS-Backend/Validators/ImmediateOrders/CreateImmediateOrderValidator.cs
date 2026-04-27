using FluentValidation;
using DMS_Backend.Models.DTOs.ImmediateOrders;

namespace DMS_Backend.Validators.ImmediateOrders;

public sealed class CreateImmediateOrderValidator : AbstractValidator<CreateImmediateOrderDto>
{
    public CreateImmediateOrderValidator()
    {
        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Order date is required");

        RuleFor(x => x.DeliveryTurnId)
            .NotEmpty().WithMessage("Delivery turn is required");

        RuleFor(x => x.OutletId)
            .NotEmpty().WithMessage("Outlet is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product is required");

        RuleFor(x => x.FullQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Full quantity must be 0 or greater")
            .LessThanOrEqualTo(9999.9999m).WithMessage("Full quantity cannot exceed 9999.9999");

        RuleFor(x => x.MiniQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Mini quantity must be 0 or greater")
            .LessThanOrEqualTo(9999.9999m).WithMessage("Mini quantity cannot exceed 9999.9999");

        RuleFor(x => x.RequestedBy)
            .NotEmpty().WithMessage("Requested by is required")
            .MaximumLength(200).WithMessage("Requested by cannot exceed 200 characters");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required")
            .MaximumLength(1000).WithMessage("Reason cannot exceed 1000 characters");
    }
}
