using AutoMapper;
using DMS_Backend.Models.DTOs.OutletEmployees;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class OutletEmployeeProfile : Profile
{
    public OutletEmployeeProfile()
    {
        CreateMap<OutletEmployee, OutletEmployeeListDto>()
            .ForMember(dest => dest.OutletName,
                opt => opt.MapFrom(src => src.Outlet.Name))
            .ForMember(dest => dest.UserName,
                opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.UserEmail,
                opt => opt.MapFrom(src => src.User.Email));

        CreateMap<OutletEmployee, OutletEmployeeDetailDto>()
            .ForMember(dest => dest.OutletName,
                opt => opt.MapFrom(src => src.Outlet.Name))
            .ForMember(dest => dest.OutletCode,
                opt => opt.MapFrom(src => src.Outlet.Code))
            .ForMember(dest => dest.UserName,
                opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.UserEmail,
                opt => opt.MapFrom(src => src.User.Email));

        CreateMap<CreateOutletEmployeeDto, OutletEmployee>();
        CreateMap<UpdateOutletEmployeeDto, OutletEmployee>();
    }
}
