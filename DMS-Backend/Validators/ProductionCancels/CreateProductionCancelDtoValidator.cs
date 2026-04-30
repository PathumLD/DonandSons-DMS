using DMS_Backend.Models.DTOs.ProductionCancels;
using FluentValidation;

namespace DMS_Backend.Validators.ProductionCancels;

public class CreateProductionCancelDtoValidator : AbstractValidator<CreateProductionCancelDto>
{
    public CreateProductionCancelDtoValidator()
    {
        RuleFor(x => x.CancelDate)
            .NotEmpty().WithMessage("Cancel date is required");

        RuleFor(x => x.ProductionNo)
            .NotEmpty().WithMessage("Production number is required")
            .MaximumLength(50).WithMessage("Production number cannot exceed 50 characters");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product is required");

        RuleFor(x => x.CancelledQty)
            .GreaterThan(0).WithMessage("Cancelled quantity must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required")
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters");
    }
}
