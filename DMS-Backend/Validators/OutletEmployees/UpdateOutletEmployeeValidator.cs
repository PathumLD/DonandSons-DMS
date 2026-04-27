using FluentValidation;
using DMS_Backend.Models.DTOs.OutletEmployees;

namespace DMS_Backend.Validators.OutletEmployees;

public sealed class UpdateOutletEmployeeValidator : AbstractValidator<UpdateOutletEmployeeDto>
{
    public UpdateOutletEmployeeValidator()
    {
        RuleFor(x => x.OutletId)
            .NotEmpty().WithMessage("Outlet is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User is required");

        RuleFor(x => x.Designation)
            .MaximumLength(50).WithMessage("Designation cannot exceed 50 characters");

        RuleFor(x => x.JoinedDate)
            .NotEmpty().WithMessage("Joined date is required")
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Joined date cannot be in the future");

        RuleFor(x => x.LeftDate)
            .GreaterThanOrEqualTo(x => x.JoinedDate).When(x => x.LeftDate.HasValue)
            .WithMessage("Left date must be after joined date");
    }
}
