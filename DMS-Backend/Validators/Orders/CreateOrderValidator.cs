using FluentValidation;
using DMS_Backend.Models.DTOs.Orders;

namespace DMS_Backend.Validators.Orders;

public sealed class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.OrderNo)
            .NotEmpty().WithMessage("Order number is required")
            .MaximumLength(50).WithMessage("Order number cannot exceed 50 characters");

        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Order date is required");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters");
    }
}
