using DMS_Backend.Models.DTOs.DailyProductions;
using FluentValidation;

namespace DMS_Backend.Validators.DailyProductions;

public class CreateDailyProductionDtoValidator : AbstractValidator<CreateDailyProductionDto>
{
    public CreateDailyProductionDtoValidator()
    {
        RuleFor(x => x.ProductionDate)
            .NotEmpty().WithMessage("Production date is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product is required");

        RuleFor(x => x.PlannedQty)
            .GreaterThan(0).WithMessage("Planned quantity must be greater than 0");

        RuleFor(x => x.ProducedQty)
            .GreaterThan(0).WithMessage("Produced quantity must be greater than 0");

        RuleFor(x => x.ShiftId)
            .NotEmpty().WithMessage("Shift is required");
    }
}
