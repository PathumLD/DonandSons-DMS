using AutoMapper;
using DMS_Backend.Models.DTOs.RecipeTemplates;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public class RecipeTemplateProfile : Profile
{
    public RecipeTemplateProfile()
    {
        CreateMap<RecipeTemplate, RecipeTemplateListDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

        CreateMap<RecipeTemplate, RecipeTemplateDetailDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

        CreateMap<RecipeTemplateCreateDto, RecipeTemplate>();
        
        CreateMap<RecipeTemplateUpdateDto, RecipeTemplate>();
    }
}
