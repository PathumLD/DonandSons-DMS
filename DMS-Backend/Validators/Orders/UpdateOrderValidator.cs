using FluentValidation;
using DMS_Backend.Models.DTOs.Orders;

namespace DMS_Backend.Validators.Orders;

public sealed class UpdateOrderValidator : AbstractValidator<UpdateOrderDto>
{
    public UpdateOrderValidator()
    {
        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Order date is required");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters");
    }
}
